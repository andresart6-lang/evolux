import React from 'react';

// Encabezado de página estandarizado — mismo tamaño, interlineado e interletrado
// que el del Dashboard. Parametrizado: title, subtitle, un slot `right` opcional
// (selector de mes, botón, etc.) alineado horizontalmente con el título, y un
// tope de caracteres en la frase para que nunca rompa el layout.
export default function PageHeader({ title, subtitle, right, maxChars = 48 }) {
    const sub = subtitle && subtitle.length > maxChars
        ? subtitle.slice(0, maxChars - 1).trimEnd() + '…'
        : subtitle;
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[0.95]">{title}</h1>
                {sub && <p className="text-text-muted text-lg -mt-1 font-medium opacity-80 truncate">{sub}</p>}
            </div>
            {right && <div className="shrink-0">{right}</div>}
        </div>
    );
}
