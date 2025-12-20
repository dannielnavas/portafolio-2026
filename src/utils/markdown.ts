import { marked } from 'marked';
// @ts-ignore - prismjs no tiene tipos completos
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-markdown';

/**
 * Configura y retorna un renderer de marked con syntax highlighting usando Prism.js
 */
function createMarkdownRenderer(): marked.Renderer {
    const renderer = new marked.Renderer();

    // @ts-ignore - tipos incompatibles entre versiones
    renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
        const language = lang || 'text';
        const highlighted = Prism.highlight(
            text,
            Prism.languages[language] || Prism.languages.text,
            language
        );
        return `<pre class="language-${language}"><code class="language-${language}">${highlighted}</code></pre>`;
    };

    return renderer;
}

/**
 * Configura marked con opciones por defecto y retorna una función para parsear markdown
 */
export function configureMarkdown() {
    const renderer = createMarkdownRenderer();

    marked.setOptions({
        renderer,
        breaks: true,
        gfm: true,
    });
}

/**
 * Parsea markdown a HTML con syntax highlighting
 */
export function parseMarkdown(markdown: string): string {
    configureMarkdown();
    return marked.parse(markdown) as string;
}
