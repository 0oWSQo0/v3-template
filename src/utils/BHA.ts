import { ElMessageBox } from 'element-plus'
import { SM4EcbCrypter } from './SM4'

/**
 * 参数处理
 * @param {*} params  参数
 */
function tansParams(params: any) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    const part = encodeURIComponent(propName) + '='
    if (value !== null && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && typeof value[key] !== 'undefined') {
            const params = propName + '[' + key + ']'
            const subPart = encodeURIComponent(params) + '='
            result += subPart + encodeURIComponent(value[key]) + '&'
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&'
      }
    }
  }
  return result
}

enum SKFInterface {
  EnumDev = '01000001', // 枚举设备
  OpenDev = '01000002', // 打开设备
  CloseDev = '01000003', // 关闭设备
  ModifyLabel = '01000004', // 修改设备标签
  DevInfo = '01000005', // 获取设备信息
  DevState = '01000006', // 获取设备状态
  DevAuth = '02000003', // 设备认证
  ChangePIN = '02000004', // 修改PIN码
  PinInfo = '02000005', // 获取PIN信息
  CheckPIN = '02000006', // 操作员登录/验证PIN码
  UnlockOperator = '02000007', // 解锁操作员PIN码
  Logout = '02000008', // 注销登录
  EnumDevApp = '03000001', // 枚举应用
  CreateApp = '03000002', // 创建应用
  DelApp = '03000003', // 删除应用
  OpenApp = '03000004', // 打开应用
  CreateFile = '04000002', // 创建文件
  DelFile = '04000003', // 删除文件
  EnumFile = '04000004', // 枚举文件
  FileInfo = '04000005', // 获取文件信息
  ReadFile = '04000006', // 读取文件
  WriteFile = '04000007', // 写入文件
  CreateContainer = '05000001', // 创建容器
  DelContainer = '05000002', // 删除容器
  EnumContainer = '05000003', // 枚举容器
  OpenContainer = '05000004', // 打开容器
  GenerateRandom = '06000002', // 生成随机数
  ExportPublicKey = '06000017', // 导出公钥
  ImportPublicKey = '06000019', // 导入明文密钥
  SymmetricCryptoA = '0600001A', // 对称加密A
  SymmetricCryptoB = '0600001B', // 对称加密A
  GenerateKey = '0600000B', // 生成密钥
  SM3Hash = '06000022', // SM3 hash
  SM3Digest = '06000023', // SM3 摘要
  SM2Sign = '0600000D', // SM2 签名
  GenerateCertReq = '07000001' // 生成证书请求
}

enum SKFErrorMsg {
  EnumDev = '未检测到 UKEY', // 枚举设备
  OpenDev = 'UKEY 错误，请联系管理员', // 打开设备
  DevInfo = '获取设备信息失败', // 获取设备信息
  DevState = '01000006', // 获取设备状态
  DevAuth = '02000003', // 设备认证
  ChangePIN = 'PIN 码修改失败', // 修改PIN码
  PinInfo = '02000005', // 获取PIN信息
  CheckPIN1 = '当前UKEY已锁定，请联系管理员解除锁定。', // 操作员登录/验证PIN码
  CheckPIN2 = 'PIN 码验证失败', // 操作员登录/验证PIN码
  UnlockOperator = 'PIN 码重置失败', // 解锁操作员PIN码
  Logout = '02000008', // 注销登录
  EnumDevApp = '03000001', // 枚举应用
  CreateApp = 'UKEY 应用空间不足', // 创建应用
  DelApp = '03000003', // 删除应用
  OpenApp = '03000004', // 打开应用
  CreateFile = '04000002', // 创建文件
  DelFile = '04000003', // 删除文件
  EnumFile = '04000004', // 枚举文件
  FileInfo = '04000005', // 获取文件信息
  ReadFile = '04000006', // 读取文件
  WriteFile = '文件写入失败', // 写入文件
  CreateContainer = '05000001', // 创建容器
  DelContainer = '05000002', // 删除容器
  EnumContainer = '05000003', // 枚举容器
  OpenContainer = '05000004', // 打开容器
  GenerateRandom = '06000002', // 生成随机数
  ExportPublicKey = '06000017', // 导出公钥
  ImportPublicKey = '06000019', // 导入明文密钥
  SymmetricCryptoA = '0600001A', // 对称加密A
  SymmetricCryptoB = '0600001B', // 对称加密A
  GenerateKey = '0600000B', // 生成密钥
  SM3Hash = '06000022', // SM3 hash
  SM3Digest = '06000023', // SM3 摘要
  SM2Sign = '0600000D', // SM2 签名
  GenerateCertReq = '生成证书请求文件失败' // 生成证书请求
}
const exceptionHandler = (e: any, defaultMsg: string = '操作失败') => {
  const arr = [SKFInterface.EnumDev, SKFInterface.OpenDev, SKFInterface.CreateApp, SKFInterface.CheckPIN, SKFInterface.ChangePIN, SKFInterface.WriteFile]
  if(arr.includes(e.code)) {
    console.log(e)
    ElMessageBox.alert(e.msg || defaultMsg, '系统提示', { type: 'error' })
  }
}

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
    ElMessageBox.alert('未检测到UKEY服务或参数错误', '系统提示', { type: 'error' })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, prefer-const
let hdevice = '',
  happlication = '',
  hcontainer = ''

/**
 * 枚举设备
 * @returns 设备列表
 */
const EnumDevice = async () => {
  const { devList } = await service({ order: SKFInterface.EnumDev })
  return devList.length === 0 ? Promise.reject({ code: SKFInterface.EnumDev, msg: SKFErrorMsg.EnumDev }) : Promise.resolve(devList)
}

/**
 * 打开设备
 * @param devname 要打开的设备名称
 * @returns
 */
const OpenDevice = async (devname: string) => {
  const { rev, hdev } = await service({ order: SKFInterface.OpenDev, devname })
  if(hdev) {
    hdevice = hdev
    return Promise.resolve(hdev)
  }
  if(rev === '167772163') {
    return Promise.reject({ code: SKFInterface.OpenDev, msg: SKFErrorMsg.OpenDev })
  }
  return Promise.reject({ code: SKFInterface.OpenDev, msg: SKFErrorMsg.OpenDev })
}
/**
 * 获取 UKEY 设备信息
 * @param index 设备句柄
 * @returns
 */
const GetKeyInfo = async (index: number = 0) => {
  try {
    if (!hdevice) {
      const devList = await EnumDevice()
      await OpenDevice(devList[index])
    }
    const { devInfo } = await service({ order: SKFInterface.DevInfo, hdevice })
    return devInfo ? Promise.resolve(devInfo) : Promise.reject({ code: SKFInterface.DevInfo, msg: SKFErrorMsg.DevInfo })
  } catch(e) {
    console.log(e)
    exceptionHandler(e, SKFErrorMsg.DevInfo)
    return Promise.reject()
  }
}

/**
 * 生成随机数
 * @param len 生成的随机数长度
 * @returns
 */
const GenerateRandom = async ({ index = 0, len = 16 }: { index?: number; len?: number }): Promise<string> => {
  if (!hdevice) {
    const devList = await EnumDevice()
    await OpenDevice(devList[index])
  }
  const { ranData } = await service({ order: SKFInterface.GenerateRandom, hdevice, len })
  return ranData ? Promise.resolve(ranData) : Promise.reject()
}
/**
 * 枚举应用
 * @returns 应用数组
 */
const EnumApplication = async (): Promise<string> => {
  const { appList } = await service({ order: SKFInterface.EnumDevApp, hdevice })
  return Promise.resolve(appList || [])
}
/**
 * 设备认证(删除操作时需要先对设备进行认证才可继续操作)
 * @param authKey 设备认证密钥
 * @returns
 */
const AuthenticateDevice = async () => {
  // 1.生成随机数
  const random = await GenerateRandom({len: 8})
  // 2.计算认证数据
  const authData = SM4EcbCrypter.encrypt(random, '1234567812345678')
  console.log(authData)
  // 3.设备认证
  const { rev } = await service({ order: SKFInterface.DevAuth, hdevice, authData })
  return rev === '0' ? Promise.resolve() : Promise.reject()
}
/**
 * 删除应用
 * @param appName 应用名称
 * @returns
 */
const DeleteApplication = async (appName: string) => {
  await AuthenticateDevice()
  // 2. 删除应用
  const { rev } = await service({ order: SKFInterface.DelApp, hdevice, appName })
  return rev === '0' ? Promise.resolve() : Promise.reject()
}

/**
 * 创建应用
 * @param appName 应用名称
 * @param userPin PIN码
 * @returns
 */
const CreateApplication = async ({ appName, userPin }: { appName: string; userPin: string }) => {
  const appList = await EnumApplication()
  if (appList.length === 3) {
    return Promise.reject({ code: SKFInterface.CreateApp, msg: SKFErrorMsg.CreateApp })
  }
  const { rev } = await service({
    order: SKFInterface.CreateApp,
    hdevice,
    appName, // 应用名称
    adminPin: 11111111, // 管理员PIN码
    adminRetry: 5, // 管理员PIN重试次数
    userPin, // 操作员PIN码
    userRetry: 5, // 操作员PIN重试次数
    createFileRights: 0x00000010
  })
  return rev === '0' ? Promise.resolve() : Promise.reject()
}
/**
 * 打开应用
 * @param appName 应用名称
 * @returns
 */
const OpenApplication = async (appName: string) => {
  // 1.打开应用
  const { happ } = await service({ order: SKFInterface.OpenApp, hdevice, appName })
  if (happ) {
    // 2.保存应用句柄
    happlication = happ
    return Promise.resolve()
  }
  return Promise.reject()
}
/**
 * 枚举容器
 * @returns
 */
const EnumContainer = async (): Promise<string[]> => {
  // 1.枚举容器
  const { containerList } = await service({ order: SKFInterface.EnumContainer, happlication })
  return Promise.resolve(containerList)
}
/**
 * 创建容器
 * @param containerName 容器名称
 * @returns
 */
const CreateContainer = async (containerName: string) => {
  // 1.创建容器
  const { rev } = await service({ order: SKFInterface.CreateContainer, happlication, containerName })
  rev === '0' ? Promise.resolve() : Promise.reject()
}
/**
 * 打开容器
 * @param containerName 容器名称
 * @returns
 */
const OpenContainer = async (containerName: string) => {
  // 1.打开容器
  const container = await service({ order: SKFInterface.OpenContainer, happlication, containerName })
  // 2.保存容器句柄
  hcontainer = container.hcontainer
  return container ? Promise.resolve() : Promise.reject()
}
/**
 * 枚举文件
 * @returns
 */
const EnumFile = async (): Promise<string[]> => {
  const { filelist } = await service({ order: SKFInterface.EnumFile, happlication })
  return Promise.resolve(filelist)
}
/**
 * 创建文件
 * @param filename 文件名称
 * @param filesize 文件大小
 * @returns
 */
const CreateFile = async ({filename, filesize} : {filename: string, filesize: number}) => {
  // 1.创建文件
  const { rev } = await service({ order: SKFInterface.CreateFile, happlication, filename, filesize, readrights: 255, writerights: 255 })
  return rev === '0' ? Promise.resolve() : Promise.reject()
}
/**
 * 获取文件信息
 * @param filename 文件名
 * @returns
 */
const GetFileInfo = async (filename: string) => {
  // 1.获取文件信息
  const { rev, fileInfo } = await service({ order: SKFInterface.FileInfo, happlication, filename })
  return rev === '0' ? Promise.resolve(fileInfo) : Promise.reject()
}
/**
 * 删除文件
 * @param filename 文件名
 * @returns
 */
const DeleteFile = async (filename: string) => {
  // 1.删除文件
  const { rev } = await service({ order: SKFInterface.DelFile, happlication, filename })
  return rev === '0' ? Promise.resolve() : Promise.reject()
}
/**
 * 读取文件
 * @param filename 文件名
 * @param offset 读取的偏移地址
 * @param size 数据大小
 * @returns
 */
const ReadFile = async ({filename, size} : {filename: string, size: number}) => {
  // 1.读取文件内容
  const { rev, data } = await service({ order: SKFInterface.ReadFile, happlication, filename, offset: 0, size })
  return rev === '0' ? Promise.resolve(data) : Promise.reject()
}
/**
 * 写入文件
 * @param filename 文件名称
 * @param offset 偏移地址
 * @param data 写入的数据
 * @returns
 */
const WriteFile = async ({ filename, data, index = 0, appName, userPin } : {filename: string, data: string, index?: number, appName?: string, userPin: string}) => {
  if(!hdevice) {
    const devList = await EnumDevice()
    await OpenDevice(devList[index])
  }
  if(!happlication) {
    await OpenApplication(appName)
    await checkPin({ pin: userPin })
  }
  const fileList = await EnumFile()
  if(fileList.includes(filename)) {
    await DeleteFile(filename)
  }
  // 1.写入文件
  const { rev } = await service({ order: SKFInterface.WriteFile, happlication, filename, offset: 0, data })
  return rev === '0' ? Promise.resolve() : Promise.reject({ code: SKFInterface.WriteFile, msg: SKFErrorMsg.WriteFile })
}
/**
 * 生成p10
 */
const GenerateCertReq = async (szCN: string) => {
  const { csr } = await service({ order: SKFInterface.GenerateCertReq, hdevice, hcontainer, szCN, szOU: '', szO: '', szS: '', szL: '' })
  return csr ? Promise.resolve(csr) : Promise.reject({ code: SKFInterface.GenerateCertReq, msg: SKFErrorMsg.GenerateCertReq })
}
/**
 * 操作员/管理员登录
 * @param appName 应用名称
 * @param pin PIN码
 * @param index 设备句柄
 * @param pinType PIN类型，操作员 1，管理员 0
 * @returns
 */
const checkPin = async ({ pin, pinType = 1 }: { pin: string, pinType?: number }) => {
    // 3. 登录操作员/校验PIN码
    const { rev, retryCount } = await service({ order: SKFInterface.CheckPIN, happlication, pinType, pin })
    if (rev === '0') {
      return Promise.resolve()
    }
    if (rev === '167772197') {
      // 操作员权限已锁定，不可再登陆
      // ElMessageBox.alert(SKFErrorMsg.CheckPIN1, '系统提示', { type: 'error' })
      return Promise.reject({ code: SKFInterface.CheckPIN, msg: SKFErrorMsg.CheckPIN1 })
    }
    if (rev !== '0' && retryCount) {
      // 获取 PIN 码验证重试次数
      const count = retryCount.slice(retryCount.indexOf('(') + 1, retryCount.indexOf(')'))
      // ElMessageBox.alert(`PIN码验证失败，剩余尝试次数：${count}次`, '系统提示', { type: 'error' })
      return Promise.reject({ code: SKFInterface.CheckPIN, msg: `PIN码验证失败，剩余尝试次数：${count}次`})
    }
    // ElMessageBox.alert(SKFErrorMsg.CheckPIN2, '系统提示', { type: 'error' })
    return Promise.reject({ code: SKFInterface.CheckPIN, msg: SKFErrorMsg.CheckPIN2 })
}

/**
 * (业务)验证pin码
 * @param param0 
 * @returns 
 */
const CheckPin = async ({ index = 0, appName, pin }: { appName: string, pin: string, index?: number }) => {
  try {
    if(!hdevice) {
      const devList = await EnumDevice()
      await OpenDevice(devList[index])
    }
    if(!happlication) {
      await OpenApplication(appName)
    }
    await checkPin({ pin })
    return Promise.resolve()
  } catch (e) {
    console.log(e)
    exceptionHandler(e, 'PIN码验证失败')
    return Promise.reject()
  }
}

/**
 * 修改 UKEY 应用的 PIN 码
 * @param appName 应用名称
 * @param oldPin 原PIN码
 * @param newPin 新PIN码
 * @param pinType PIN类型，操作员 1，管理员 0
 * @returns
 */
const ResetPin = async ({ appName, newPin, index = 0 }: { appName: string, newPin: string, index: number }) => {
  try {
    if(!hdevice) {
      const devList = await EnumDevice()
      await OpenDevice(devList[index])
    }
    if(!happlication) {
      await OpenApplication(appName)
    }
    await resetPin(newPin)
  } catch(e) {
    console.log(e)
    exceptionHandler(e, 'PIN 码重置失败')
    return Promise.reject()
  }
}
const resetPin = async (newPin: string) => {
  const { rev } = await service({ order: SKFInterface.UnlockOperator, happlication, adminPin: 11111111, newPin })
  return rev === '0' ? Promise.resolve() : Promise.reject({ order: SKFInterface.UnlockOperator, msg: SKFErrorMsg.UnlockOperator })
}
const changePin = async ({ newPin, oldPin }: {newPin: string, oldPin: string}) => {
  const { rev } = await service({ order: SKFInterface.ChangePIN, happlication, pinType: 1, oldPin, newPin })
  return rev === '0' ? Promise.resolve() : Promise.reject({ code: SKFInterface.ChangePIN, msg: SKFErrorMsg.ChangePIN })
}
/**
 * (业务)修改PIN码
 * @param param0 
 * @returns 
 */
const ChangePin = async ({ appName, newPin, oldPin, index = 0 }: { appName: string, newPin: string, oldPin: string, index?: number }) => {
  try {
    if(!hdevice) {
      const devList = await EnumDevice()
      await OpenDevice(devList[index])
    }
    if(!happlication) {
      await OpenApplication(appName)
    }
    await checkPin({ pin: oldPin })
    await changePin({ newPin, oldPin })
    return Promise.resolve()
  } catch(e) {
    console.log(e)
    exceptionHandler(e, 'PIN 码修改失败')
    return Promise.reject()
  }
}
/**
 * 签名，对数据进行加密
 * @param appName 应用或容器名称
 * @param userPin PIN 码
 * @param indata 要加密的明文
 * @returns 签名值
 */
const SM2 = async ({ appName, plaindata, containerName, index = 0, userPin }: { appName?: string; plaindata: string; containerName: string, index?: number, userPin?: string }) => {
  if (!hdevice) {
    const devList = await EnumDevice()
      await OpenDevice(devList[index])
  }
  if (!happlication) {
    await OpenApplication(appName)
    await checkPin({ pin: userPin })
  }
  // 1. 打开容器
  if (!hcontainer) {
    await OpenContainer(containerName)
  }
  // 5. sm2 (私钥)签名，对摘要进行加密
  const { eccsignatureblob } = await service({ order: SKFInterface.SM2Sign, hcontainer, plaindata })
  return eccsignatureblob ? Promise.resolve(eccsignatureblob) : Promise.reject()
}
/**
 * SM3
 * @param indata 加密数据
 * @param appName 应用名称
 * @param containerName 容器名称
 * @returns SM3加密结果
 */
const SM3 = async ({ indata, appName, containerName, index = 0, userPin }: any) => {
  if (!hdevice) {
    const devList = await EnumDevice()
      await OpenDevice(devList[index])
  }
  if (!happlication) {
    await OpenApplication(appName)
    await checkPin({ pin: userPin })
  }
  // 1. 打开容器
  if (!hcontainer) {
    await OpenContainer(containerName)
  }
  // 2. 导出公钥
  const { publickeyblob } = await service({ order: SKFInterface.ExportPublicKey, happlication })
  // 3. 用公钥计算 Hash
  const { hhash } = await service({ order: SKFInterface.SM3Hash, hdevice, algid: 1, eccpublickeyblob: publickeyblob, id: 'MTIzNDU2NzgxMjM0NTY3OA==' })
  // 4. 对明文进行摘要
  const { digest } = await service({ order: SKFInterface.SM3Digest, hhash, indata })
  return digest ? Promise.resolve(digest) : Promise.reject()
}
const SM2WithSM3 = async ({ appName, indata, containerName, index = 0, userPin }: { appName?: string; indata: string; containerName: string, index?: number, userPin?: string }) => {
  if (!hdevice) {
    const devList = await EnumDevice()
      await OpenDevice(devList[index])
  }
  if (!happlication) {
    await OpenApplication(appName)
    await checkPin({ pin: userPin })
  }
  // 1. 打开容器
  if (!hcontainer) {
    await OpenContainer(containerName)
  }
  const { publickeyblob } = await service({ order: SKFInterface.ExportPublicKey, happlication })
  // 3. 用公钥计算 Hash
  const { hhash } = await service({ order: SKFInterface.SM3Hash, hdevice, algid: 1, eccpublickeyblob: publickeyblob, id: 'MTIzNDU2NzgxMjM0NTY3OA==' })
  // 4. 对明文进行摘要
  const { digest } = await service({ order: SKFInterface.SM3Digest, hhash, indata })
  const { eccsignatureblob } = await service({ order: SKFInterface.SM2Sign, hcontainer, plaindata: digest })
  return eccsignatureblob ? Promise.resolve(eccsignatureblob) : Promise.reject()
}
/**
 * SM4
 * @param param0
 * @returns SM4对称加密结果
 */
const SM4 = async ({ publicKey, plain, appName, containerName, index = 0, userPin }: any) => {
  if (!hdevice) {
    const devList = await EnumDevice()
      await OpenDevice(devList[index])
  }
  if (!happlication) {
    await OpenApplication(appName)
    await checkPin({ pin: userPin })
  }
  // 1. 打开容器
  if (!hcontainer) {
    await OpenContainer(containerName)
  }
  const { hkey } = await service({ order: SKFInterface.ImportPublicKey, hdevice, publicKey, algid: 1025 })
  await service({ order: SKFInterface.SymmetricCryptoA, hkey, iv: null, paddingtype: 1 })
  const { encrypt } = await service({ order: SKFInterface.SymmetricCryptoB, hkey, plain })
  return encrypt ? Promise.resolve(encrypt) : Promise.reject()
}

/**
 * (业务)生成证书请求
 * @param appName 应用名称
 * @param userPin 应用PIN码
 * @param szCN 证书公用名称，如：用户名
 */
const GenerateCSR = async ({ index = 0, appName, userPin, userName, containerName }: { appName: string; userPin: string; userName: string; containerName: string; index?: number }) => {
  try {
    const devList = await EnumDevice()
    await OpenDevice(devList[index])
    const appList = await EnumApplication()
    if(appList && appList.includes(appName)) {
      await DeleteApplication(appName)
    }
    await CreateApplication({ appName, userPin })
    await OpenApplication(appName)
    await checkPin({ pin: userPin })
    await CreateContainer(containerName)
    await OpenContainer(containerName)
    const csr = await GenerateCertReq(userName)

    return Promise.resolve(csr)
  } catch (e) {
    exceptionHandler(e, '生成证书请求失败')
    return Promise.reject()
  }
}

const CheckKeyStatus = async (index: number = 0) => {
  try {
    const devList = await EnumDevice()
    const { devState } = await service({ order: SKFInterface.DevState, devname: devList[index] })
    if(devState === '1') {
      return Promise.resolve()
    }

    ElMessageBox.alert('未检测到UKEY', '系统提示', { type: 'error' })
    return Promise.reject()
  } catch(e) {
    exceptionHandler(e, '未检测到UKEY')
    return Promise.reject()
  }
}

export { CheckPin, GetKeyInfo, GenerateRandom, GenerateCSR, WriteFile, ResetPin, CheckKeyStatus, ChangePin, SM2WithSM3 }
