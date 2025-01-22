const systemApplicationList = {
    'com.lbe.security.miui': 1, // com.lbe.security.miui
    'com.miui.player': 1, // com.miui.player
    'com.miui.fm': 1, // com.miui.fm
    'com.miui.hybrid': 1, // com.miui.hybrid
    'com.miui.securitycenter': 1, // com.miui.securitycenter
    'com.miui.compass': 1, // com.miui.compass
    'com.miui.contentextension': 1, // com.miui.contentextension
    'com.miui.misound': 1, // com.miui.misound
    'com.miui.voiceassist': 1, // com.miui.voiceassist
    'com.miui.securityadd': 1, // com.miui.securityadd
}

const topApplicationList = {
    'com.miui.touchassistant': 1, // 悬浮球
    'com.miui.whitenoise': 1, // 小米白噪音
    'com.tencent.mobileqq': 1, // QQ
    'com.tencent.mm': 1, // 微信
    'com.alibaba.android.rimet': 1, // 钉钉
    'com.coolapk.market': 1, // 酷安
    'com.sina.weibo': 1, // 微博
    'com.baidu.tieba': 1, // 贴吧
    'com.xuetangx.ykt': 1, // 雨课堂
    'io.github.vvb2060.magisk': 1, // Magisk
    'com.topjohnwu.magisk': 1, // Magisk
    'io.github.huskydg.magisk': 1, // Magisk
    'io.github.a13e300.ksuwebui': 1, // KsuWebUI
    'me.weishu.kernelsu': 1, // KSU
    'me.bmax.apatch': 1, // APatch
    'com.dna.tools': 1,  // DNA Android
    'com.sevtinge.hyperceiler': 1, // HyperCeiler
    'com.github.kr328.clash.foss': 1, // Clash For Android
    'com.github.kr328.clash': 1, // Clash For Android
    'com.github.metacubex.clash.meta': 1, // Clash For Android
    'com.rocket.e5b382b19324e0a': 1, // Clash For Android
    'dev.miuiicons.pedroz': 1, // 完美图标计划
    'com.tencent.androidqqmail': 1, // QQ邮箱
    'com.jingdong.app.mall': 1, // 京东
    'com.tencent.wework': 1, // 企业微信
    'com.tencent.weworkenterprise': 1, // 企业微信独立部署版
    'com.taobao.trip': 1, // 飞猪
    'com.fenbi.android.leo': 1, // 小猿口算
    'com.duokan.reader': 1, // 多看阅读
    'com.xiaomi.shop': 1, // 小米商城
    'com.xiaomi.smarthome': 1, // 米家
    'com.youdao.dict': 1, // 网易有道词典
    'com.netease.uu': 1, // UU加速器
    'com.lemon.lv': 1, // 剪映
    'com.valvesoftware.android.steam.community': 1, // Steam
    'com.douban.book.reader': 1, // 豆瓣阅读
    'com.amazon.kindlefc': 1, // Kindle
    'com.alicloud.databox': 1, // 阿里云盘
    'com.huawei.appmarket': 1, // 华为应用商店
    'com.huawei.smarthome': 1, // 华为智慧生活
    'mark.via': 1, // via
    'com.fenbi.android.servant': 1, // 粉笔
    'com.fenbi.android.zhaojiao': 1, // 粉笔教师
    'com.eusoft.eudic': 1, // 欧路词典
    'com.eusoft.ting.en': 1, // 每日英语体力
    'com.cnki.android.cnkimobile': 1, // 全球学术快报
    'com.zui.calculator': 1, // ZUI计算器
    'com.jd.app.reader': 1, // 京东读书
    'com.huajiao': 1, // 花椒直播
    'com.youku.phone': 1, // 优酷视频
    'com.tencent.qqlive': 1, // 腾讯视频
    'com.xiaomi.gamecenter': 1, // 小米游戏中心
    'com.kugou.android': 1, // 酷狗音乐
    'com.ss.android.ugc.aweme': 1, // 抖音
    'com.ss.android.ugc.live': 1, // 抖音火山版
    'com.ss.android.ugc.aweme.lite': 1, // 抖音极速版
    'com.smile.gifmaker': 1, // 快手
    'com.kuaishou.nebula': 1, // 快手极速版
    'com.bdatu.geography': 1, // 华夏地理
    'com.ubestkid.beilehu.android': 1, // 贝乐虎儿歌
    'youqu.android.todesk': 1, // Todesk
    'com.tencent.docs': 1, // 腾讯文档
    'com.tencent.pao': 1, // 天天酷跑
    'com.estrongs.android.pop': 1, // ES文件管理器
    'com.adobe.reader': 1, // Adobe Acrobat
    'com.microsoft.skydrive': 1, // Microsoft OneDrive
    'cn.com.langeasy.LangEasyLexis': 1, // 不背单词
    'cn.ticktick.task': 1, // 滴答清单
    'com.google.earth': 1, //谷歌地图
    'com.omarea.vtools': 1, // Scene
    'com.plan.kot32.tomatotime': 1, // 番茄Todo
    'com.farplace.qingzhuo': 1, // 清浊
    'com.xiachufang': 1, // 下厨房
    'com.happyteam.dubbingshow': 1, // 配音秀
    'czh.mindnode': 1, // 思维导图
    'com.chrissen.card': 1, // 麻雀记
    'top.onepix.timeblock': 1, // 块时间
    'www.imxiaoyu.com.musiceditor': 1, // 音乐剪辑
    'com.mmbox.xbrowser': 1, // X浏览器
    'com.flyersoft.moonreader': 1, // 静读天下
    'com.flyersoft.moonreaderp': 1, // 静读天下 Pro
    'com.yikaobang.yixue': 1, // 医考帮
    'com.kwai.m2u': 1, // 一甜相机
    'com.qiyi.video.pad': 1, // 爱奇艺Pad版
    'com.baidu.baidutranslate': 1, // 百度翻译
    'org.zwanoo.android.speedtest': 1, // SpeedTest
    'com.xiwang.zaixian': 1, // 希望学
    'com.yozo.office': 1, //鲸鲮office
    'com.taobao.taobao': 1, // 淘宝
    'cn.canva.editor': 1, // Canva可画
    'com.singularity.tiangong': 1, // 天工
    'com.mubu.app': 1, // 幕布
    'chuxin.shimo.shimowendang': 1, // 石墨文档
    'com.roblox.client': 1, // ROBLOX
    'com.netease.cloudmusic': 1, // 网易云音乐
    'com.netease.mc.mi': 1, // 网易我的世界
    'com.netease.x19': 1, // 网易我的世界
    'com.netease.mc.huawei': 1, // 网易我的世界
    'com.netease.mc.vivo': 1, // 网易我的世界
    'com.netease.mc.oppo': 1, // 网易我的世界
    'com.netease.mc.honor': 1, // 网易我的世界
    'com.netease.mc.bilibili': 1, // 网易我的世界
    'com.netease.mc.nearme.gamecenter': 1, // 网易我的世界
    'com.netease.mc': 1, // 网易我的世界
    'com.netease.mctest': 1, // 网易我的世界
    'com.hicloud.browser': 1, // 花瓣浏览器
    'com.hihonor.health': 1, // 荣耀运动健康
    'com.ss.android.ugc.livelite': 1, // 抖音商城
    'com.oray.sunlogin': 1, // 向日葵
    'com.microsoft.todos': 1, // 微软todo
    'com.jdjdc.jdfastjdc': 1, // 奶酪单词
    'com.google.android.apps.translate': 1, // google翻译
    'com.adsk.sketchbook': 1, // Sketchbook
    'com.pick.sketchbook': 1, // Sketchbook
    'com.ihuman.recite': 1, // 万词王
    'com.ctfile': 1, // 城通网盘
    'com.quark.scanking': 1, // 夸克扫描王
    'com.hunantv.imgo.activity': 1, // 芒果TV
    'com.sohu.sohuvideo': 1, // 搜狐视频
    'com.wuba.town.client': 1, //58同城
    'com.yhqx.player': 1, // 光子播放器
    'com.lixiangdong.mediaplayer': 1, // 万能电影播放器
    'cn.ylkj.zmjh': 1, // 朝暮计划
    'com.yixinli.muse': 1, // 冥想星球
    'com.antutu.ABenchMark': 1, // 安兔兔评测
    'cn.honor.qinxuan': 1, // 荣耀亲选
    'com.fenbi.android.zenglish.hd': 1, // 斑马AI学
    'com.huawei.videoeditor': 1, // 花瓣剪辑
    'com.huawei.genexcloud.speedtest': 1, // 花瓣测速
    'com.huawei.ch18': 1, // 华为智能体脂秤
    'com.hihonor.dz.reader': 1, // 荣耀阅读
    'com.hihonor.vmall': 1, // 荣耀商城
    'com.hihonor.magichome': 1, // 荣耀智慧空间
    'com.hihonor.heartstudy': 1, // 荣耀心脏健康研究
    'cn.ieway.evcapture': 1, // EV录屏
    'cn.ieway.evplayer2': 1, // EVPlayer2
    'com.aliyun.wuying.enterprise': 1, // 无影云电脑
    'com.jingdong.app.reader.campus': 1, // 京东读书专业版
    'com.UCMobile': 1, // UC浏览器
    'com.quark.browser': 1, // 夸克浏览器
    'com.smzdm.client.android': 1, // 什么值得买
    'com.baidu.netdisk': 1, // 百度网盘
    'com.mfcloudcalculate.networkdisk': 1, // 123云盘
    'com.chinamobile.mcloud': 1, // 中国移动云盘
    'info.muge.appshare': 1, // AppShare
    'com.x7890.shortcutcreator': 1, // 创建快捷方式
    'org.kde.kdeconnect_tp': 1, // KDE Connect
    'com.tencent.weread': 1, // 微信读书
    'com.larus.nova': 1, // 豆包
    'com.moonshot.kimichat': 1, // Kimi 智能助手
    'com.baidu.newapp': 1, // 文小言
    'com.tencent.hunyuan.app.chat': 1, //腾讯元宝
    'jp.pokemon.pokemonsleep': 1, // Pokémon Sleep
    'com.heytap.headset': 1, // 欢律
    'com.twitter.android': 1, // X
    'cn.jagat.main': 1, // Jagat果汁儿
    'com.furrybar.chat.app': 1, // FurryBar
    'me.ele': 1, // 饿了么
    'com.max.xiaoheihe': 1, // 小黑盒
    'com.ruanmei.ithome': 1, // IT之家
    'com.youdao.translator': 1, // 有道翻译官
    'com.netflix.NGP.MonumentValley3': 1, // 纪念碑谷3
    'com.ophone.reader.ui': 1, // 咪咕阅读
    'studio.fountainhead.habicat': 1, // 像素习惯
    'com.hihonor.appmarket': 1, // 荣耀应用市场
    'cn.wenyu.bodian': 1, // 波点音乐
    'com.zte.smarthome': 1, // 中兴智慧生活
    'com.phoenix.read': 1, // 红果免费短剧
    'com.bilibili.app.in': 1, // 哔哩哔哩国际版
    'com.bilibili.app.blue': 1, // 哔哩哔哩概念
    'com.joey.colors.simple.c': 1, // 中国传统色
    'com.hanfuhui': 1, // 汉服荟
    'com.hurantech.cherrysleep': 1, // 樱桃睡眠
    'tech.caicheng.youshi': 1, // 有诗
    'org.panda.words': 1, // 熊猫在学
    'com.tencent.phoenix': 1, // 秒剪
    'com.tencent.wetype': 1, // 微信输入法
    'com.tencent.wehear': 1, // 微信听书
    'com.tencent.weishi': 1, // 腾讯微视
    'com.ctg.itrdc.clouddesk': 1, // 天翼云电脑
    'com.oppo.store': 1, // OPPO 商城
    'com.pupumall.customer': 1, // 朴朴超市
    'me.tangke.gamecores': 1, // 机核
    'com.xunmeng.pinduoduo': 1, // 拼多多
    'com.vblast.flipaclip': 1, // FlipaClip
    'com.gstarmc.android': 1, // CAD看图王
    'com.quickview3d': 1, // 快视3D看图
    'com.aihuishou.opt': 1, // 拍机堂
    'com.duolingo': 1, // 多邻国
    'cn.etouch.ecalendar.life': 1, // 微鲤万年历
    'cn.etouch.ecalendar': 1, // 中华万年历
    'com.gamestar.pianoperfect': 1, // 随身乐队
    'me.yoopu.app.songbook': 1, // 有谱么
    'com.autonavi.minimap': 1, // 高德地图
    'com.tencent.map': 1, // 腾讯地图
    'com.baidu.BaiduMap': 1, // 百度地图
    'com.yuzebin.pokemon': 1, // 神奇宝贝图鉴
    'com.CDA.StructureMaster': 1, // 结构大师
    'com.cxincx.xxjz': 1, // 小星记账
}

export default {
    ...systemApplicationList,
    ...topApplicationList
}