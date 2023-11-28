import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import IconsResolver from 'unplugin-icons/resolver'

export default function createAutoImport() {
  return AutoImport({
    imports: [
      'vue',
      'vue-router',
      'pinia',
      '@vueuse/core',
      {
        from: 'vue',
        imports: ['ComponentInternalInstance'],
        type: true
      },
      {
        from: 'element-plus',
        imports: ['FormInstance'],
        type: true
      }
    ],
    resolvers: [ElementPlusResolver(), IconsResolver()],
    dts: 'src/auto-imports.d.ts'
  })
}
