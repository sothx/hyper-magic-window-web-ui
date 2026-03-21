export interface NZMSystemSettingConfig {
  // 画质等级,3对应精致画质
  QualityLevel: number;
  // 帧率，7对应120帧，6对应90帧
  FPSLevel: number;
  // 机甲模式下的视野大小,例如120.000000
  MechaFPPViewportDimension: number;
  // 人物模式下的持枪视野大小，例如120.000000
  FPPViewportDimension: number;
}