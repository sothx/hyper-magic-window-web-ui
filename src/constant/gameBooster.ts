import { invert } from 'lodash-es';
type Dictionary<T> = {
	[key: string]: T;
};
type GameRatioMap = Dictionary<string>;
type GameGravityMap = Dictionary<string>;

export const gameRatioMap: GameRatioMap =invert({
    RATIO_FULLSCREEN: "0.0",
    RATIO_16_TO_9: "1.7777778",
    RATIO_4_TO_3: "1.3333333",
    RATIO_21_TO_9: "2.3333333"
});


export const ratioOptionItems = {
    RATIO_FULLSCREEN: {
        color: 'info',
        name: '全屏'
    }, // 屏幕填充
    RATIO_16_TO_9: {
        color: 'error',
        name: '16:9'
    }, // 16:9
    RATIO_4_TO_3: {
        color: '#8a2be2',
        name: '4:3'
    }, // 4:3
    RATIO_21_TO_9: {
        color: 'warning',
        name: '21:9'
    }
} as const;

export const gameRatioOptions = () => {
    return Object.entries(gameRatioMap).map(([value, key]) => {
      // 通过反转后的 key（比例标识）从 ratioOptionItems 获取对应的选项
      const option = ratioOptionItems[key as keyof typeof ratioOptionItems];
  
      return {
        label: option.name, // 映射为名称
        value: value, // 保留比例值
        color: option.color // 映射为颜色
      };
    });
};

export const gameGravityMap: GameGravityMap = invert({
    GRAVITY_CENTER: 17,
    GRAVITY_TOP: 48,
    GRAVITY_BOTTOM: 80,
})

export const gravityOptionItems = {
    GRAVITY_CENTER: {
        color: 'info',
        name: '居中显示'
    },
    GRAVITY_TOP: {
        color: 'warning',
        name: '居顶显示'
    },
    GRAVITY_BOTTOM: {
        color: 'error',
        name: '居底显示'
    }
}

export const gameGravityOptions = () => {
    return Object.entries(gameGravityMap).map(([value, key]) => {
      // 使用反转后的 key 来查找 gravityOptionItems
      const option = gravityOptionItems[key as keyof typeof gravityOptionItems];
      
      return {
        label: option.name, // 映射为名称
        value: value, // 保留重力值
        color: option.color // 映射为颜色
      };
    });
}
