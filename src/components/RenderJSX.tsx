import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import type { JSX } from 'vue/jsx-runtime';

export const RenderJsx = defineComponent({
  props: {
    content: {
      type: Object as PropType<JSX.Element>,
      required: true,
    },
  },
  setup(props) {
    return () => props.content;
  },
});