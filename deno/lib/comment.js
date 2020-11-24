import Node from "./node.js";

class Comment extends Node {
  constructor(defaults) {
    super(defaults);
    this.type = "comment";
  }
}

export default Comment;
