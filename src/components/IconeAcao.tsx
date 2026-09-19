import React from 'react';
import Icone from './Icone';

// Bloco A12 (2026-09-18) -- estes cinco eram SVG desenhados A MAO aqui
// dentro: cinco `path` escritos na mao, cada um com o seu tracado, sem
// nenhuma relacao com o resto do app. O resultado e' que uma acao de linha
// e um item de menu que dizem a mesma coisa desenhavam coisas diferentes,
// porque nasceram em arquivos diferentes.
//
// Agora saem do mesmo vocabulario do menu (components/Icone.tsx). O ganho
// nao e' so' de consistencia: `ordem` deixou de ser tres tracinhos
// inventados e virou o `GripVertical`, que e' o desenho que qualquer pessoa
// ja' reconhece como "arraste isto".
//
// A API NAO mudou -- `tipo`, `titulo`, `onClick` --, entao nenhuma das telas
// que usam o componente precisou ser tocada.
type TipoIcone = 'editar' | 'remover' | 'ordem' | 'reativar' | 'anular';

// Neutro por padrao (cinza), muda de cor no hover conforme o tipo -- sem cor
// forte fixa. Isto veio do desenho original e fica: e' o que faz uma fileira
// de acoes nao virar um semaforo colorido no meio da lista.
const corHover: Record<TipoIcone, string> = {
  editar: '#2946E0',
  remover: '#D62828',
  ordem: '#1B2E8A',
  reativar: '#1E7A46',
  anular: '#B26A00',
};

export default function IconeAcao({
  tipo,
  titulo,
  onClick,
}: {
  tipo: TipoIcone;
  titulo: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const [emHover, setEmHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      title={titulo}
      onMouseEnter={() => setEmHover(true)}
      onMouseLeave={() => setEmHover(false)}
      style={{
        background: emHover ? '#F0F1F7' : 'transparent',
        border: 'none',
        borderRadius: 6,
        padding: 5,
        cursor: 'pointer',
        display: 'inline-flex',
        // `color` e' o que o `Icone` le: ele desenha em `currentColor`, entao
        // o icone acompanha o hover sem receber nenhuma prop de cor.
        color: emHover ? corHover[tipo] : '#8A8FA3',
      }}
    >
      {/* `tipo` e `NomeIcone` sao o mesmo vocabulario -- os cinco nomes daqui
          existem no mapa central --, entao a chave passa direto, sem uma
          tabela de traducao no meio pra manter em dia. */}
      <Icone nome={tipo} tamanho={16} />
    </button>
  );
}
