import {visit} from 'unist-util-visit';
import type {Root} from 'mdast';

function isHiddenUrl(url: string): boolean {
  return /instructor-notes/i.test(url) || /PHASE-2-CONTINUE/i.test(url);
}

export default function remarkStripHiddenLinks() {
  return (tree: Root) => {
    visit(tree, 'link', (node, index, parent) => {
      if (index === undefined || !parent) {
        return;
      }
      if (isHiddenUrl(node.url ?? '')) {
        parent.children.splice(index, 1, ...node.children);
        return index;
      }
    });
  };
}
