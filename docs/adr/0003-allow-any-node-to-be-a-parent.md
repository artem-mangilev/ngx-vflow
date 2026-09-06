# Allow any node type to be a parent

Parenthood is a coordinate-hierarchy role, not a presentation type: any node may be referenced as another node's parent. Group node types continue to provide group presentation, but structural graph operations and documentation must not require a parent node to use one of those types; this preserves the runtime's existing flexibility at the cost of widening the former Subflows documentation contract.
