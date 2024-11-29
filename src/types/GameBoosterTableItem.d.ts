/**
 * 表示游戏显示布局的规则配置项。
 */
export default interface GameBoosterTableItem {
    /** 包名 */
    package_name: string;
  
    /** 应用名称 */
    app_name: string;

    /** 游戏显示比例 */
    // 0.0 | 2.3333333 | 1.3333333 | 1.7777778
    game_ratio: string;

    /** 游戏显示位置 居底80，居顶48，居中17 */
    // 17 | 48 | 80
    game_gravity: string;
  }
  