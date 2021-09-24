import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localforage from 'localforage';

const fileCache = localforage.createInstance({
  name: 'filecache',
});

(async () => {
  await fileCache.setItem('color', 'red');
})();

export const unpkgPathPlugin = (inputCode: string) => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
        return {
          path: 'index.js',
          namespace: 'a',
        };
      });

      build.onResolve({ filter: /^\.+\// }, async (args: any) => {
        return {
          namespace: 'a',
          path: new URL(args.path, 'https://unpkg.com' + args.resolveDir + '/')
            .href,
        };
      });

      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`,
        };
        /* else if (args.path === 'tiny-test-pkg') {
          return {
            path: 'https://unpkg.com/tiny-test-pkg@1.0.0/index.js',
            namespace: 'a',
          };
        }*/
      });

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: inputCode,
          };
        }

        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );

        if (cachedResult) {
          return cachedResult;
        }

        const { data, request } = await axios.get(args.path);
        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname,
        };

        await fileCache.setItem(args.path, result);
        return result;
      });
    },
  };
};
