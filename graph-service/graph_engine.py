import networkx as nx
import os
import requests

class GraphEngine:
    def __init__(self, data_path="../data-simulation"):
        self.graph = nx.DiGraph()
        self.data_path = data_path
        
        # Supabase Config
        self.supabase_url = os.environ.get("SUPABASE_URL", "https://gpdhyiohcagqydhhjzrz.supabase.co")
        self.supabase_key = os.environ.get("SUPABASE_KEY", "sb_publishable_DixO3g1pvbB4aRuaTXh4Mw_5miq-nXW")
        self.rest_url = f"{self.supabase_url}/rest/v1"
        self.headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
        }
        
        self.load_data()

    def sb_query(self, table: str, params: dict = None) -> list:
        """Query Supabase REST API."""
        try:
            resp = requests.get(
                f"{self.rest_url}/{table}",
                headers=self.headers,
                params=params or {},
                timeout=15
            )
            if resp.status_code == 200:
                return resp.json()
            else:
                print(f"Supabase query error ({table}): {resp.status_code}")
                return []
        except Exception as e:
            print(f"Supabase connection error: {e}")
            return []

    def load_data(self):
        """
        Load transactions from Supabase (or CSV fallback) to build the graph.
        """
        print("Loading Graph Data...")
        
        # Try Supabase first
        print("  Trying Supabase...")
        # Fetch all transactions (paginated - Supabase returns max 1000 by default)
        all_txns = []
        offset = 0
        page_size = 1000
        while True:
            rows = self.sb_query("transactions", {
                "select": "buyer_id,seller_id",
                "limit": str(page_size),
                "offset": str(offset)
            })
            if not rows:
                break
            all_txns.extend(rows)
            if len(rows) < page_size:
                break
            offset += page_size
        
        if all_txns:
            print(f"  Loaded {len(all_txns)} transactions from Supabase.")
            self._build_graph_from_rows(all_txns)
            return
        
        # CSV Fallback
        print("  Supabase unavailable, falling back to CSV...")
        try:
            import pandas as pd
            tx_path = os.path.join(self.data_path, "transactions.csv")
            if os.path.exists(tx_path):
                df = pd.read_csv(tx_path)
                rows = df[['buyer_id', 'seller_id']].to_dict('records')
                self._build_graph_from_rows(rows)
            else:
                print(f"  Warning: {tx_path} not found")
        except Exception as e:
            print(f"  Error loading CSV: {e}")

    def _build_graph_from_rows(self, rows: list):
        """Build NetworkX graph from transaction rows."""
        # Count edges (buyer -> seller)
        edge_counts = {}
        for row in rows:
            key = (row['buyer_id'], row['seller_id'])
            edge_counts[key] = edge_counts.get(key, 0) + 1
        
        for (buyer_id, seller_id), count in edge_counts.items():
            self.graph.add_edge(
                buyer_id, seller_id,
                type='TRANSACTED_WITH',
                weight=count
            )
            self.graph.nodes[buyer_id]['type'] = 'Buyer'
            self.graph.nodes[seller_id]['type'] = 'Seller'
        
        print(f"  Graph built: {self.graph.number_of_nodes()} nodes, {self.graph.number_of_edges()} edges.")

    def find_fraud_rings(self):
        """
        Detect simple cycles or dense subgraphs indicating collusion.
        """
        try:
            undirected = self.graph.to_undirected()
            communities = list(nx.community.louvain_communities(undirected))
            suspicious_communities = [list(c) for c in communities if 3 <= len(c) <= 10]
            return suspicious_communities[:5]
        except Exception as e:
            print(f"Error in fraud ring detection: {e}")
            return []

    def get_centrality_score(self, seller_id):
        """
        Compute In-Degree Centrality for a seller (popularity).
        """
        try:
            if self.graph.has_node(seller_id):
                return self.graph.in_degree(seller_id)
            return 0
        except Exception:
            return 0

    def detect_collusion(self, seller_id):
        """
        Check if a seller's buyers are also connected to each other (clustering coefficient).
        """
        try:
            if self.graph.has_node(seller_id):
                return nx.clustering(self.graph, seller_id)
            return 0.0
        except Exception:
            return 0.0
