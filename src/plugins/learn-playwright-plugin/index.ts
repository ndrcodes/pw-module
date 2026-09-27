import path from 'path';
import type {LoadContext, Plugin} from '@docusaurus/types';

export default function pluginLearnPlaywright(
  context: LoadContext,
): Plugin {
  const learnContentDir = path.join(context.siteDir, 'learn-content');

  return {
    name: 'docusaurus-plugin-learn-playwright',

    configureWebpack(config) {
      config.module!.rules!.unshift({
        test: /\.mdsource$/,
        include: [learnContentDir],
        type: 'asset/source',
      });
    },

  };
}
