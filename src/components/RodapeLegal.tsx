import React from 'react';
import { useI18n } from '../i18n/I18nContext';
import { PAGINAS_LEGAIS, urlLegal, rotuloLegal } from '../i18n/linksLegais';

// Bloco A09 (2026-09-18) -- o rodape com os quatro links legais.
//
// Fica num componente proprio, e nao solto dentro do Layout, porque ele
// aparece em DUAS situacoes de formatos diferentes: como barra de
// rodape nas telas logadas (centralizado, largura toda) e como bloco no
// canto inferior direito da tela de login. O texto e o endereco sao os
// mesmos; so o posicionamento muda -- entao o que muda fica com quem
// usa, e o conteudo fica aqui.
//
// O idioma vem do mesmo useI18n() que pinta a tela inteira. Isso e'
// exatamente o que o pedido original descreve: "ajustar o link de
// acordo com o idioma que estiver selecionado na plataforma". Nao ha
// deteccao de idioma separada aqui -- se a interface esta em italiano, a
// politica de privacidade abre em italiano.

// Os links abrem em aba nova: sao outro site (veridati.online), e jogar
// o usuario para fora do app no meio de uma tarefa perderia o que ele
// estava fazendo.
export default function RodapeLegal({ alinhamento = 'centro' }: { alinhamento?: 'centro' | 'direita' }) {
  const { idioma } = useI18n();

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 18,
        alignItems: 'center',
        justifyContent: alinhamento === 'direita' ? 'flex-end' : 'center',
        fontSize: 12,
      }}
    >
      {PAGINAS_LEGAIS.map((pagina) => (
        <a
          key={pagina}
          href={urlLegal(pagina, idioma)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#8A8FA3', textDecoration: 'none' }}
        >
          {rotuloLegal(pagina, idioma)}
        </a>
      ))}
    </div>
  );
}
