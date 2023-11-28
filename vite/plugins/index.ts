import vue from '@vitejs/plugin-vue'
import { PluginOption } from 'vite'
import createAutoImport from './auto-import'
import createComponents from './components'
import createCompression from './compression'
import createSetupExtend from './setup-extend'
import createSvgIcon from './svg-icon'
import Icons from 'unplugin-icons/vite'

export default function createVitePlugins(viteEnv: Record<string, string>, isBuild = false) {
  const vitePlugins: PluginOption[] = [
    vue(),
    createAutoImport(),
    createComponents(),
    createSetupExtend(),
    createSvgIcon(isBuild),
    Icons({ autoInstall: true })
  ]
  isBuild && vitePlugins.push(...createCompression(viteEnv))
  return vitePlugins
}