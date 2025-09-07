export interface MainNode {
  created_at?: string
  updated_at?: string
}

export default class MainModel<NodeType> {
  public node: NodeType

  constructor(node: NodeType) {
    this.node = node
  }
}
