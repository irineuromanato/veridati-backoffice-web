import React from 'react';
import {
  BuildingComplex,
  Palette,
  MapPin,
  Layers,
  Users,
  ListChecks,
  ClipboardCheck,
  Library,
  Camera,
  Map,
  ChartColumn,
  ShieldCheck,
  CloudUpload,
  Monitor,
  Smartphone,
  CirclePlay,
  CalendarDays,
  SquareCheckBig,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  LogIn,
  Pencil,
  Trash,
  GripVertical,
  RotateCcw,
  Ban,
  Bell,
  Plus,
  Search,
  X,
  ChevronDown,
  Download,
  Upload,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  CircleAlert,
  TriangleAlert,
  Info,
  Inbox,
  Filter,
  Clock,
  User,
  RefreshCw,
  SquareCheck,
  Square,
  Phone,
  Globe,
  Cake,
  type LucideIcon,
} from 'lucide-react';

// Bloco A12 (2026-09-18) -- o vocabulario de icones do Veridati.
//
// Este arquivo e' o MESMO do Account (veridati-account-web, mesmo caminho).
// Os dois sao projetos separados, sem pacote comum, entao a copia e' o
// mecanismo -- mas o conteudo tem de andar junto: `checklists` desenha o
// mesmo simbolo nos dois produtos, senao o vocabulario deixa de ser um
// vocabulario e vira dois.
//
// Uma lista so, e nao <BuildingComplex /> espalhado por trinta arquivos. O
// motivo e' o de sempre quando se centraliza um vocabulario: trocar o icone
// de "Checklists" passa a ser uma linha aqui, em vez de uma cacada; e quem
// le o codigo le `nome="checklists"`, que e' o SIGNIFICADO, e nao a forma do
// desenho -- que e' justamente a parte que muda.
//
// Os quinze primeiros sao a tabela da pagina Plataforma do site, na ordem
// dela. A' esquerda, o nome que voce escreveu; a' direita, o nome canonico
// no Lucide 1.x, quando ele mudou. A biblioteca saiu do 0.x e renomeou
// quatro deles:
//
//   Organizacao             Building2   -> BuildingComplex
//   Zonas                   Layers3     -> Layers
//   Dashboard               BarChart3   -> ChartColumn
//   Importacoes             UploadCloud -> CloudUpload
//
// Os nomes antigos AINDA existem, como alias -- importar `Building2` hoje
// compila. Usamos os canonicos de proposito: alias e' exatamente o que a
// biblioteca pretende apagar, e no dia do upgrade os quatro quebrariam de
// uma vez, sem aviso e no meio de um arquivo grande. Assim o nome que
// quebra e' este, e ele quebra aqui, sozinho.
export const ICONES = {
  // Os quinze da tabela da pagina Plataforma.
  organizacao: BuildingComplex,
  personalizacao: Palette,
  localidades: MapPin,
  zonas: Layers,
  equipes: Users,
  tarefas: ListChecks,
  checklists: ClipboardCheck,
  biblioteca: Library,
  evidencias: Camera,
  mapa: Map,
  dashboard: ChartColumn,
  seguranca: ShieldCheck,
  importacoes: CloudUpload,
  account: Monitor,
  mobile: Smartphone,

  // Navegacao do app.
  execucoes: CirclePlay,
  agenda: CalendarDays,
  aprovacoes: SquareCheckBig,
  relatorios: FileText,
  plano: CreditCard,
  configuracao: Settings,
  sair: LogOut,
  // A porta ao contrario do `sair`: e' o botao de entrar, nas telas
  // deslogadas. Sem ele o "Entrar" ficaria com o desenho de sair.
  entrar: LogIn,

  // Acoes de linha de lista (o antigo IconeAcao, agora com o mesmo
  // desenho do resto -- antes eram SVG desenhados a mao).
  editar: Pencil,
  remover: Trash,
  ordem: GripVertical,
  reativar: RotateCcw,
  anular: Ban,

  // Acoes e estados comuns.
  notificacoes: Bell,
  adicionar: Plus,
  buscar: Search,
  fechar: X,
  expandir: ChevronDown,
  baixar: Download,
  enviar: Upload,
  email: Mail,
  senha: Lock,
  ver: Eye,
  ocultar: EyeOff,
  ok: Check,
  erro: CircleAlert,
  aviso: TriangleAlert,
  // "Nao ha' nada aqui" -- o estado vazio. Nao e' um erro e nao e' aviso:
  // uma lista em dia fica vazia todo dia.
  vazio: Inbox,
  info: Info,
  filtro: Filter,
  relogio: Clock,
  usuario: User,
  atualizar: RefreshCw,

  // Bloco A12 (2026-09-19) -- as chaves que faltavam para tirar os ultimos
  // glifos de texto do sistema: o par ☑/☐ do item feito, o 🌐 do seletor de
  // idioma, o 📞 do telefone do local e o 🎂 dos aniversariantes. Cada um
  // desses era um caracter que mudava de desenho conforme a fonte do
  // aparelho -- que e' exatamente o que este vocabulario existe para evitar.
  feito: SquareCheck,
  naoFeito: Square,
  telefone: Phone,
  globo: Globe,
  aniversario: Cake,
} satisfies Record<string, LucideIcon>;

export type NomeIcone = keyof typeof ICONES;

// O componente que o resto do app usa. `cor` sai em `currentColor` por
// padrao, e isso e' o que faz o icone acompanhar o texto ao lado sem
// ninguem precisar passar a cor: no menu, o link ativo pinta de azul e o
// icone vem junto de graca.
export default function Icone({
  nome,
  tamanho = 18,
  cor = 'currentColor',
  espessura = 2,
  estilo,
}: {
  nome: NomeIcone;
  tamanho?: number;
  cor?: string;
  espessura?: number;
  estilo?: React.CSSProperties;
}) {
  const Desenho = ICONES[nome];
  return (
    <Desenho
      size={tamanho}
      color={cor}
      strokeWidth={espessura}
      style={{ flexShrink: 0, ...estilo }}
      aria-hidden
    />
  );
}
