import { cloneDeep, invert } from 'lodash-es';
type Dictionary<T> = {
	[key: string]: T;
};
type GameRatioMap = Dictionary<string>;
type GameGravityMap = Dictionary<string>;

export const gameRatioMap: GameRatioMap =invert({
    RATIO_FULLSCREEN: "0.0",
    RATIO_16_TO_9: "1.7777778",
    RATIO_4_TO_3: "1.3333333",
    RATIO_21_TO_9: "2.3333333",
    RATIO_32_TO_9: "3.5555556"
});


export const ratioOptionItems = {
    RATIO_FULLSCREEN: {
        type: 'info',
        name: '全屏',
        color: {}
    }, // 屏幕填充
    RATIO_16_TO_9: {
        type: 'error',
        name: '16:9',
        color: {}
    }, // 16:9
    RATIO_4_TO_3: {
        type: 'success',
        name: '4:3',
        color: {}
    }, // 4:3
    RATIO_21_TO_9: {
        type: 'warning',
        name: '21:9',
        color: {}
    },
    RATIO_32_TO_9: {
        type: 'primary',
        name: '32:9',
        color: {
            color: "rgba(255, 105, 180, 0.1)",
            borderColor: "rgba(255, 105, 180, 0.3)",
            textColor: "#ff69b4"
        },
    }
} as const;

export interface GameRatioOptions {
    label:string;
    value: string;
    type?: string;
    color?: {
        color: string;
        borderColor: string;
        textColor: string;
    };
}

export const gameRatioOptions = (inputArr?:GameRatioOptions[]) : GameRatioOptions[] => {
    console.log(inputArr,'inputArr')
    const copyInputArr = cloneDeep(inputArr)
    let ratioOptions = Object.entries(gameRatioMap).map(([value, key]) => {
      // 通过反转后的 key（比例标识）从 ratioOptionItems 获取对应的选项
      const option = ratioOptionItems[key as keyof typeof ratioOptionItems];
  
      return {
        label: option.name, // 映射为名称
        value: value, // 保留比例值
        type: option.type,
        color: option.color // 映射为颜色
      };
    }) as GameRatioOptions[];

    if (copyInputArr) {
        ratioOptions = [
            ...ratioOptions,
            ...copyInputArr
        ]
    }

    return ratioOptions;
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
        color: 'success',
        name: '居顶显示'
    },
    GRAVITY_BOTTOM: {
        color: 'error',
        name: '居底显示'
    }
}

export interface GameGravityOptions {
    label:string;
    value: string;
    color: string;
}

export const gameGravityOptions = () : GameGravityOptions[] => {
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



/**
 * 为了保持色彩的和谐与多样性，可以考虑以下常见的颜色和它们的变种：

橙色
青色（青蓝）
粉色
深蓝色
深灰色
这些颜色都可以在设计中与绿色、紫色、蓝色、黄色和红色搭配使用，避免单一色调的单调感。

以下是我为你生成的这几种颜色的 border、text 和 background 格式：
1. 橙色
border: rgba(255, 165, 0, 0.3)
text: #ffa500
background: rgba(255, 165, 0, 0.1)
2. 青色（青蓝）
border: rgba(0, 255, 255, 0.3)
text: #00ffff
background: rgba(0, 255, 255, 0.1)
3. 粉色
border: rgba(255, 105, 180, 0.3)
text: #ff69b4
background: rgba(255, 105, 180, 0.1)
4. 深蓝色
border: rgba(0, 0, 139, 0.3)
text: #00008b
background: rgba(0, 0, 139, 0.1)
5. 深灰色
border: rgba(169, 169, 169, 0.3)
text: #a9a9a9
background: rgba(169, 169, 169, 0.1)


 */