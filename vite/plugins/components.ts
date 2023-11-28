import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

export default function createComponents() {
  return Components({
    dts: 'src/components.d.ts',
    resolvers: [ElementPlusResolver(), IconsResolver()]
  })
}