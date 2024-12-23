const systemApplicationList = [
    'com.lbe.security.miui',
    'com.miui.player',
    'com.miui.fm',
    'com.miui.hybrid',
    'com.miui.securitycenter',
    'com.miui.compass',
    'com.miui.contentextension',
    'com.miui.misound',
    'com.miui.voiceassist',
    'com.lbe.security.miui',
    'com.miui.securityadd'
]

const topApplicationList = [
    'com.miui.touchassistant', // 悬浮球
    'com.miui.whitenoise', // 小米白噪音
    'com.tencent.mobileqq', // QQ
    'com.tencent.mm', // 微信
    'com.alibaba.android.rimet', // 钉钉
    'com.coolapk.market', // 酷安
    'com.sina.weibo', // 微博
    'com.baidu.tieba', // 贴吧
    'com.xuetangx.ykt', // 雨课堂
    //Magisk
    'io.github.vvb2060.magisk',
    'com.topjohnwu.magisk',
    'io.github.huskydg.magisk',
    'io.github.a13e300.ksuwebui', // KsuWebUI
    'me.weishu.kernelsu', // KSU
    'me.bmax.apatch', // APatch
    'com.dna.tools',  // DNA Android
    'com.coolapk.market', // 酷安
    'com.sevtinge.hyperceiler', // HyperCeiler
     // Clash For Android
    'com.github.kr328.clash.foss',
    'com.github.kr328.clash',
    'com.github.metacubex.clash.meta',
    'com.rocket.e5b382b19324e0a',
    'dev.miuiicons.pedroz', // 完美图标计划
    'com.tencent.androidqqmail', // QQ邮箱
    'com.jingdong.app.mall', // 京东
    'com.tencent.wework', // 企业微信
    'com.taobao.trip', // 飞猪
    'com.fenbi.android.leo', // 小猿口算
    'com.duokan.reader',// 多看阅读
    'com.xiaomi.shop', // 小米商城
    'com.xiaomi.smarthome', // 米家
    'com.youdao.dict', // 网易有道词典
    'com.netease.uu', // UU加速器
    'com.lemon.lv', // 剪映
    'com.valvesoftware.android.steam.community', // Steam
    'com.douban.book.reader', // 豆瓣阅读
    'com.amazon.kindlefc', // Kindle
    'com.alicloud.databox', // 阿里云盘
    'com.huawei.appmarket', // 华为应用商店
    'com.huawei.smarthome', // 华为智慧生活
    'mark.via', //via
    'com.fenbi.android.servant', // 粉笔
    'com.fenbi.android.zhaojiao', // 粉笔教师
    'com.eusoft.eudic', // 欧路词典
    'com.eusoft.ting.en', // 每日英语体力
    'com.cnki.android.cnkimobile', // 全球学术快报
    'com.zui.calculator', // ZUI计算器
    'com.jd.app.reader', // 京东读书
    'com.huajiao', // 花椒直播
    'com.youku.phone', // 优酷视频
    'com.tencent.qqlive', // 腾讯视频
    'com.xiaomi.gamecenter', // 小米游戏中心
    'com.kugou.android', // 酷狗音乐
    'com.ss.android.ugc.aweme', // 抖音
    'com.ss.android.ugc.live', // 抖音火山版
    'com.ss.android.ugc.aweme.lite', // 抖音极速版
    'com.smile.gifmaker', // 快手
    'com.kuaishou.nebula', // 快手极速版
    'com.bdatu.geography', // 华夏地理
    'com.ubestkid.beilehu.android', // 贝乐虎儿歌
    'youqu.android.todesk', // Todesk
    'com.tencent.docs', // 腾讯文档
    'com.github.metacubex.clash.meta', //Clash Meta for Android
    'com.tencent.pao', // 天天酷跑
    'com.estrongs.android.pop', // ES文件管理器
    'com.adobe.reader', // Adobe Acrobat
    'com.microsoft.skydrive', // Microsoft OneDrive
    'cn.com.langeasy.LangEasyLexis', // 不背单词
    'cn.ticktick.task', // 滴答清单
    'com.google.earth', //谷歌地图
    'com.omarea.vtools', // Scene
    'com.plan.kot32.tomatotime', // 番茄Todo
    'com.farplace.qingzhuo', // 清浊
    'com.xiachufang', // 下厨房
    'com.happyteam.dubbingshow', // 配音秀
    'czh.mindnode', // 思维导图
    'com.chrissen.card', // 麻雀记
    'top.onepix.timeblock', // 块时间
    'www.imxiaoyu.com.musiceditor', // 音乐剪辑
    'com.mmbox.xbrowser', // X浏览器
    'com.lemon.lv', // 剪映
    'com.flyersoft.moonreader', // 静读天下
    'com.flyersoft.moonreaderp', // 静读天下 Pro
    'com.yikaobang.yixue', // 医考帮
    'com.kwai.m2u', // 一甜相机
    'com.qiyi.video.pad', // 爱奇艺Pad版
    'com.smile.gifmaker', // 快手
    'com.baidu.baidutranslate', // 百度翻译
    'org.zwanoo.android.speedtest', // SpeedTest
    'com.xiwang.zaixian', // 希望学
    'com.yozo.office', //鲸鲮office
    'com.taobao.taobao', // 淘宝
    'cn.canva.editor', // Canva可画
    'com.singularity.tiangong', // 天工
    'com.mubu.app', //幕布
    'chuxin.shimo.shimowendang', // 石墨文档
    'com.roblox.client', // ROBLOX
    'com.netease.cloudmusic', // 网易云音乐
    'com.netease.mc.mi',// 网易我的世界
    'com.netease.x19',// 网易我的世界
    'com.netease.mc.huawei',// 网易我的世界
    'com.netease.mc.vivo',// 网易我的世界
    'com.netease.mc.oppo',// 网易我的世界
    'com.netease.mc.honor',// 网易我的世界
    'com.netease.mc.bilibili',// 网易我的世界
    'com.netease.mc.nearme.gamecenter',// 网易我的世界
    'com.netease.mc.aligames',// 网易我的世界
    'com.netease.mc.lenovo',// 网易我的世界
    'com.netease.mc.meta',// 网易我的世界
    'com.netease.mc.baidu',// 网易我的世界
    'com.netease.mc',// 网易我的世界
    'com.netease.mctest',// 网易我的世界
    'com.hicloud.browser', // 花瓣浏览器
    'com.hihonor.health', // 荣耀运动健康
    'com.ss.android.ugc.livelite', // 抖音商城
    'com.oray.sunlogin', // 向日葵
    'com.microsoft.todos', // 微软todo
    'com.jdjdc.jdfastjdc', // 奶酪单词
    'com.google.android.apps.translate', // google翻译
    'com.adsk.sketchbook', // Sketchbook
    'com.pick.sketchbook', // Sketchbook
    'com.ihuman.recite', // 万词王
    'com.ctfile', // 城通网盘
    'com.quark.scanking', // 夸克扫描王
    'com.hunantv.imgo.activity', // 芒果TV
    'com.sohu.sohuvideo', // 搜狐视频
    'com.wuba.town.client', //58同城
    'com.yhqx.player', // 光子播放器
    'com.lixiangdong.mediaplayer', // 万能电影播放器
    'cn.ylkj.zmjh', // 朝暮计划
    'com.yixinli.muse', // 冥想星球
    'com.antutu.ABenchMark', // 安兔兔评测
    'cn.honor.qinxuan', // 荣耀亲选
    'com.fenbi.android.zenglish.hd', // 斑马AI学
    'com.huawei.videoeditor', // 花瓣剪辑
    'com.huawei.genexcloud.speedtest', // 花瓣测速
    'com.huawei.smarthome', // 华为智慧生活
    'com.huawei.ch18', // 华为智能体脂秤
    'com.hihonor.dz.reader', // 荣耀阅读
    'com.hihonor.health', // 荣耀运动健康
    'com.hihonor.vmall', // 荣耀商城
    'com.hihonor.magichome', // 荣耀智慧空间
    'com.hihonor.heartstudy', // 荣耀心脏健康研究
    'cn.ieway.evcapture', // EV录屏
    'cn.ieway.evplayer2', // EVPlayer2
    'com.aliyun.wuying.enterprise', // 无影云电脑
    'com.jingdong.app.reader.campus', // 京东读书专业版
    'com.UCMobile', // UC浏览器
    'com.quark.browser', // 夸克浏览器
    'com.smzdm.client.android', // 什么值得买
    'com.baidu.netdisk', // 百度网盘
    'com.mfcloudcalculate.networkdisk', // 123云盘
    'com.chinamobile.mcloud', // 中国移动云盘
    'info.muge.appshare', // AppShare
    'com.x7890.shortcutcreator', // 创建快捷方式
    'org.kde.kdeconnect_tp', // KDE Connect
    'com.tencent.weread', // 微信读书
    'com.larus.nova', // 豆包
    'com.moonshot.kimichat', // Kimi 智能助手
    'com.baidu.newapp', // 文小言
    'com.tencent.hunyuan.app.chat', //腾讯元宝
    'jp.pokemon.pokemonsleep', // Pokémon Sleep
    'com.heytap.headset', // 欢律
    'com.twitter.android', // X
    'cn.jagat.main', // Jagat果汁儿
    'com.furrybar.chat.app', // FurryBar
    'me.ele', // 饿了么
    'com.max.xiaoheihe', // 小黑盒
    'com.ruanmei.ithome', // IT之家
    'com.youdao.translator', // 有道翻译官
    'com.netflix.NGP.MonumentValley3', // 纪念碑谷3
    'com.ophone.reader.ui', // 咪咕阅读
    'studio.fountainhead.habicat', // 像素习惯
    'com.hihonor.appmarket', // 荣耀应用市场
]


export default [
    ...systemApplicationList,
    ...topApplicationList,
]