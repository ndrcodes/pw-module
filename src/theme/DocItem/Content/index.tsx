import type {ReactNode} from 'react';
import Content from '@theme-original/DocItem/Content';
import type ContentType from '@theme/DocItem/Content';
import type {WrapperProps} from '@docusaurus/types';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import Admonition from '@theme/Admonition';

type Props = WrapperProps<typeof ContentType>;

const WIP_PREFIXES = [
  'part-4-api-testing-and-automation/',
  'part-5-web-automation-playwright/',
  'part-6-framework-engineering/',
  'part-7-cicd/',
  'part-8-professional-engineering/',
  'projects/',
  'capstone/',
  'answer-keys/part-5/',
  'answer-keys/part-6/',
  'answer-keys/part-7/',
  'answer-keys/part-8/',
];

export default function ContentWrapper(props: Props): ReactNode {
  const doc = useDoc();
  const docId = doc.metadata?.id ?? '';
  const isWip = WIP_PREFIXES.some((prefix) => docId.startsWith(prefix));

  return (
    <>
      {isWip && (
        <Admonition type="caution" title="In Progress">
          This section is still under development. You can read the objectives
          and outline now; full chapter content is being written.
        </Admonition>
      )}
      <Content {...props} />
    </>
  );
}
