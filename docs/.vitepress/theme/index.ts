import DefaultTheme from 'vitepress/theme';
import { onMounted, watch, nextTick } from 'vue';
import { useRoute } from 'vitepress';
import mermaid from 'mermaid';
import './style.css';

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute();

    const renderMermaid = async () => {
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default'
      });

      const blocks = Array.from(document.querySelectorAll('div.language-mermaid'));
      await Promise.all(
        blocks.map(async (block, index) => {
          const source = block.querySelector('code')?.textContent ?? '';
          const host = document.createElement('div');
          host.className = 'mermaid-rendered';
          const { svg } = await mermaid.render(`mermaid-${route.path.replace(/\W/g, '-')}-${index}`, source);
          host.innerHTML = svg;
          block.replaceWith(host);
        })
      );
    };

    onMounted(renderMermaid);
    watch(
      () => route.path,
      async () => {
        await nextTick();
        await renderMermaid();
      }
    );
  }
};
