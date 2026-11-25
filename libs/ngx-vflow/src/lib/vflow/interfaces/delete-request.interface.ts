/** Selected entity IDs whose deletion a keyboard user requested; the application decides whether to remove them. */
export interface DeleteRequest {
  nodeIds: string[];
  edgeIds: string[];
}
