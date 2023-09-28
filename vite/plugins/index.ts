import vue from '@vitejs/plugin-vue'
import { PluginOption } from 'vite'
import createAutoImport from './auto-import'
import createComponents from './components'
import createCompression from './compression'
import createSetupExtend from './setup-extend'
import createSvgIcon from './svg-icon'

export default function createVitePlugins(viteEnv: Record<string, string>, isBuild = false) {
  const vitePlugins: PluginOption[] = [
    vue(),
    createAutoImport(),
    createComponents(),
    createSetupExtend(),
    createSvgIcon(isBuild)
  ]
  isBuild && vitePlugins.push(...createCompression(viteEnv))
  return vitePlugins
}