import { Root } from ".";
import { IOperation } from "./IOperation";

export class MoveUpOperation implements IOperation {
  private stopPropagation = false;
  private updated = false;

  constructor(private root: Root) {}

  shouldStopPropagation() {
    return this.stopPropagation;
  }

  shouldUpdate() {
    return this.updated;
  }

  perform() {
    this.stopPropagation = true;

    const { root } = this;
    const list = root.getListUnderCursor();
    const parent = list.getParent();
    const grandParent = parent.getParent();
    const prev = parent.getPrevSiblingOf(list);

    const listStartLineBefore = root.getContentLinesRangeOf(list)[0];

    if (!prev && grandParent) {
      const newParent = grandParent.getPrevSiblingOf(parent);

      if (newParent) {
        this.updated = true;
        parent.removeChild(list);
        newParent.addAfterAll(list);
      }
    } else if (prev) {
      this.updated = true;
      parent.removeChild(list);
      parent.addBefore(prev, list);
    }

    if (!this.updated) {
      return;
    }

    const listStartLineAfter = root.getContentLinesRangeOf(list)[0];
    const lineDiff = listStartLineAfter - listStartLineBefore;

    const cursor = root.getCursor();
    root.replaceCursor({
      line: cursor.line + lineDiff,
      ch: cursor.ch,
    });
  }
}
