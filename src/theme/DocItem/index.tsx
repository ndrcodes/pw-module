import type {ReactNode} from 'react';
import DocItem from '@theme-original/DocItem';
import type DocItemType from '@theme/DocItem';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof DocItemType>;

export default function DocItemWrapper(props: Props): ReactNode {
  if (!props.content?.metadata?.id) {
    const MDXComponent = props.content;
    return <MDXComponent />;
  }
  return <DocItem {...props} />;
}
