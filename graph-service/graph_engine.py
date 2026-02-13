import networkx as nx
import pandas as pd
import os

class GraphEngine:
    def __init__(self, data_path="../data-simulation"):
        self.graph = nx.DiGraph()
        self.data_path = data_path
        self.load_data()

    def load_data(self):
        """
        Load transactions and reviews to build the graph.
        """
        print("Loading Graph Data...")
        try:
            tx_path = os.path.join(self.data_path, "transactions.csv")
            if os.path.exists(tx_path):
                df = pd.read_csv(tx_path)
                # Add edges (Buyer -> Seller)
                # We aggregate multiple transactions into weight
                grouped = df.groupby(['buyer_id', 'seller_id']).size().reset_index(name='count')
                
                for _, row in grouped.iterrows():
                    self.graph.add_edge(
                        row['buyer_id'], 
                        row['seller_id'], 
                        type='TRANSACTED_WITH',
                        weight=row['count']
                    )
                    # Add node attributes if needed
                    self.graph.nodes[row['buyer_id']]['type'] = 'Buyer'
                    self.graph.nodes[row['seller_id']]['type'] = 'Seller'
                
                print(f"Graph loaded: {self.graph.number_of_nodes()} nodes, {self.graph.number_of_edges()} edges.")
            else:
                print(f"Warning: Data file not found at {tx_path}")
        except Exception as e:
            print(f"Error loading graph data: {e}")

    def find_fraud_rings(self):
        """
        Detect simple cycles or dense subgraphs indicating collusion.
        """
        # NetworkX simple_cycles is expensive for large graphs.
        # We'll stick to a simpler heuristic for demo: Finding small cliques or strongly connected components
        try:
            # For demo, just return some random small cycles or pre-calculated ones
            # converting to undirected to find communities/cliques
            undirected = self.graph.to_undirected()
            communities = list(nx.community.louvain_communities(undirected))
            
            # Filter for small, dense communities
            suspicious_communities = [list(c) for c in communities if 3 <= len(c) <= 10]
            
            # Return top 5
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
                # Using in-degree (number of unique buyers)
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
                # Local clustering coefficient
                return nx.clustering(self.graph, seller_id)
            return 0.0
        except Exception:
            return 0.0
