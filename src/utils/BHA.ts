import { tansParams } from './common'

const url = 'http://127.0.0.1:12345/do'

const service = async (params: any) => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tansParams(params)
    })
    return await res.json()
  } catch (e) {
    Promise.reject({ msg: '未检测到服务' })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, prefer-const
let hdevice = '',
  happlication = '',
  hcontainer = ''
const BHA = {
  openDevByIndex: async (num: number) => {
    const { devList } = await service({ order: '01000001' })
    if (devList.length === 0) {
      Promise.reject({ msg: '未检测到 UKEY' })
    }
    const { hdev } = await service({ order: '01000002', devname: devList[num] })
    hdevice = hdev
    Promise.resolve()
  }
}

export default BHA
