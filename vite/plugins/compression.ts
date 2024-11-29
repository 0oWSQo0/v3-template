import { PluginOption } from "vite"
import compression from 'vite-plugin-compression'


export default function createCompression(env: Record<string, string>) {
  const { VITE_BUILD_COMPRESS } = env
  const plugin: PluginOption[] = []
  if(VITE_BUILD_COMPRESS) {
    const compressList = VITE_BUILD_COMPRESS.split(',')
    if(compressList.includes('gzip')) {
      plugin.push(compression({
        ext: '.gz',
        algorithm: 'gzip',
        deleteOriginFile: false
      }))
    }
  }
  return plugin
}