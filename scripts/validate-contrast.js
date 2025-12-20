/**
 * Script para validar el contraste de colores según WCAG 2.1
 *
 * Estándares WCAG:
 * - Nivel AA: 4.5:1 para texto normal, 3:1 para texto grande (18pt+ o 14pt+ bold)
 * - Nivel AAA: 7:1 para texto normal, 4.5:1 para texto grande
 */

// Función para convertir hex a RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Función para calcular luminancia relativa
function getLuminance(rgb) {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Función para calcular ratio de contraste
function getContrastRatio(color1, color2) {
    const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
    const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;

    if (!rgb1 || !rgb2) return null;

    const lum1 = getLuminance(rgb1);
    const lum2 = getLuminance(rgb2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
}

// Función para validar contraste
function validateContrast(foreground, background, textSize = 'normal') {
    const ratio = getContrastRatio(foreground, background);
    if (!ratio) return { valid: false, error: 'Color inválido' };

    const minRatioAA = textSize === 'large' ? 3 : 4.5;
    const minRatioAAA = textSize === 'large' ? 4.5 : 7;

    const passesAA = ratio >= minRatioAA;
    const passesAAA = ratio >= minRatioAAA;

    return {
        ratio: ratio.toFixed(2),
        passesAA,
        passesAAA,
        level: passesAAA ? 'AAA' : passesAA ? 'AA' : 'FAIL',
        textSize
    };
}

// Colores identificados en la aplicación
const colors = {
    // Fondos
    backgrounds: {
        white: '#ffffff',
        gray50: '#f9fafb',  // Tailwind gray-50
        gray100: '#f3f4f6', // Tailwind gray-100
        codeBlock: '#1e1e1e',
        codeInline: '#f3f4f6',
        statusGreen: '#ecfdf5',  // Tailwind green-50
        statusBlue: '#eff6ff',   // Tailwind blue-50
        statusOrange: '#fff7ed', // Tailwind orange-50
        statusRed: '#fef2f2',    // Tailwind red-50
        tagBlue: '#dbeafe',      // Tailwind blue-50
        authorBox: '#f9fafb',    // Tailwind gray-50
    },

    // Textos
    texts: {
        black: '#000000',
        darkGray: '#111111',
        gray900: '#111827',      // Tailwind gray-900
        gray800: '#1f2937',      // Tailwind gray-800
        gray700: '#374151',      // Tailwind gray-700
        gray600: '#4b5563',      // Tailwind gray-600
        gray500: '#6b7280',      // Tailwind gray-500
        linkBlue: '#2563eb',     // Tailwind blue-600
        linkBlueHover: '#1d4ed8', // Tailwind blue-700
        codePink: '#e83e8c',     // Tailwind pink-600
        codeText: '#d4d4d4',
        statusGreen: '#15803d',  // Tailwind green-700
        statusBlue: '#1d4ed8',   // Tailwind blue-700
        statusOrange: '#c2410c', // Tailwind orange-700
        statusRed: '#dc2626',    // Tailwind red-700
        tagBlue: '#2563eb',      // Tailwind blue-600
    }
};

// Combinaciones a validar
const combinations = [
    // Texto principal sobre fondo blanco
    { fg: colors.texts.gray800, bg: colors.backgrounds.white, name: 'Texto principal (body)', size: 'normal' },
    { fg: colors.texts.black, bg: colors.backgrounds.white, name: 'Títulos negros', size: 'large' },
    { fg: colors.texts.darkGray, bg: colors.backgrounds.white, name: 'Texto oscuro (#111)', size: 'normal' },

    // Textos grises sobre fondo blanco
    { fg: colors.texts.gray700, bg: colors.backgrounds.white, name: 'Texto gris-700', size: 'normal' },
    { fg: colors.texts.gray600, bg: colors.backgrounds.white, name: 'Texto gris-600', size: 'normal' },
    { fg: colors.texts.gray500, bg: colors.backgrounds.white, name: 'Texto gris-500', size: 'normal' },

    // Enlaces
    { fg: colors.texts.linkBlue, bg: colors.backgrounds.white, name: 'Enlaces azules', size: 'normal' },
    { fg: colors.texts.linkBlueHover, bg: colors.backgrounds.white, name: 'Enlaces azules hover', size: 'normal' },

    // Código inline
    { fg: '#be185d', bg: colors.backgrounds.codeInline, name: 'Código inline (rosa sobre gris)', size: 'normal' }, // pink-700

    // Bloques de código
    { fg: colors.texts.codeText, bg: colors.backgrounds.codeBlock, name: 'Código en bloque (gris sobre negro)', size: 'normal' },

    // Estados
    { fg: colors.texts.statusGreen, bg: colors.backgrounds.statusGreen, name: 'Estado verde', size: 'normal' },
    { fg: colors.texts.statusBlue, bg: colors.backgrounds.statusBlue, name: 'Estado azul', size: 'normal' },
    { fg: colors.texts.statusOrange, bg: colors.backgrounds.statusOrange, name: 'Estado naranja', size: 'normal' },
    { fg: '#991b1b', bg: colors.backgrounds.statusRed, name: 'Estado rojo', size: 'normal' }, // red-800

    // Tags
    { fg: colors.texts.statusBlue, bg: colors.backgrounds.tagBlue, name: 'Tags azules', size: 'normal' }, // blue-700

    // Textos sobre fondos grises
    { fg: colors.texts.gray900, bg: colors.backgrounds.authorBox, name: 'Texto sobre fondo gris-50 (AuthorBox)', size: 'normal' },
    { fg: colors.texts.gray600, bg: colors.backgrounds.authorBox, name: 'Texto gris-600 sobre fondo gris-50', size: 'normal' },
    { fg: colors.texts.black, bg: colors.backgrounds.gray100, name: 'Texto negro sobre fondo gris-100', size: 'normal' },

    // Inputs
    { fg: colors.texts.gray900, bg: colors.backgrounds.gray50, name: 'Input texto sobre fondo gris-50', size: 'normal' },

    // Hover states
    { fg: colors.texts.gray500, bg: colors.backgrounds.white, name: 'Texto gris-500 (hover states)', size: 'normal' },
];

console.log('🔍 Validación de Contraste WCAG 2.1\n');
console.log('═'.repeat(80));
console.log('Estándares:');
console.log('  • Nivel AA: 4.5:1 (texto normal) / 3:1 (texto grande)');
console.log('  • Nivel AAA: 7:1 (texto normal) / 4.5:1 (texto grande)');
console.log('═'.repeat(80));
console.log('');

let passCount = 0;
let failCount = 0;
const issues = [];

combinations.forEach(({ fg, bg, name, size }) => {
    const result = validateContrast(fg, bg, size);
    const status = result.passesAA ? '✅' : '❌';
    const level = result.level === 'AAA' ? 'AAA' : result.level === 'AA' ? 'AA ' : 'FAIL';

    console.log(`${status} [${level}] ${name}`);
    console.log(`   Ratio: ${result.ratio}:1 | Texto: ${size === 'large' ? 'Grande' : 'Normal'}`);
    console.log(`   Colores: ${fg} sobre ${bg}`);

    if (!result.passesAA) {
        failCount++;
        issues.push({
            name,
            ratio: result.ratio,
            fg,
            bg,
            size,
            required: size === 'large' ? '3:1' : '4.5:1'
        });
    } else {
        passCount++;
    }
    console.log('');
});

console.log('═'.repeat(80));
console.log(`📊 Resumen: ${passCount} ✅ | ${failCount} ❌`);
console.log('═'.repeat(80));

if (issues.length > 0) {
    console.log('\n⚠️  Problemas encontrados:\n');
    issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.name}`);
        console.log(`   Ratio actual: ${issue.ratio}:1 | Requerido: ${issue.required}`);
        console.log(`   Colores: ${issue.fg} sobre ${issue.bg}`);
        console.log('');
    });

    console.log('💡 Recomendaciones:');
    console.log('   • Ajusta los colores para aumentar el contraste');
    console.log('   • Considera usar colores más oscuros para texto sobre fondos claros');
    console.log('   • Considera usar colores más claros para texto sobre fondos oscuros');
    console.log('   • Usa herramientas como WebAIM Contrast Checker para encontrar alternativas');
} else {
    console.log('\n🎉 ¡Excelente! Todos los contrastes cumplen con WCAG AA.');
}

process.exit(issues.length > 0 ? 1 : 0);
