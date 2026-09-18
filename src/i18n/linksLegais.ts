import { Idioma } from './dicionarios';

// Bloco A09 (2026-09-18) -- os textos legais (politica de privacidade,
// termo de uso, politica de cookies e informacoes legais) vivem no
// WEBSITE, nao em nenhum dos tres apps. Aqui so se monta o endereco e o
// rotulo do link: nao ha conteudo legal neste repositorio, de proposito.
// Se o texto mudar, muda num lugar so -- no site -- e os tres apps
// passam a apontar para a versao nova sem release.
//
// Enderecos confirmados pelo Irineu em 2026-09-18:
//   https://www.veridati.online/pt-BR/privacy
//   https://www.veridati.online/pt-BR/terms
//   https://www.veridati.online/pt-BR/cookies
//   https://www.veridati.online/pt-BR/legal
//
// Por que os rotulos moram AQUI e nao no dicionarios.ts: assim o bloco
// inteiro desta funcionalidade -- endereco, caminhos e texto nos 6
// idiomas -- fica num arquivo so, que se le de ponta a ponta e se
// revisa de uma vez. O dicionario geral tem centenas de chaves; quatro
// chaves a mais la dentro, em seis blocos, nao teriam como ser
// conferidas juntas. Mesmo principio do TEXTOS do pdf-util.ts.
export const BASE_LEGAL = 'https://www.veridati.online';

// O `Idioma` do app e' um codigo interno nosso ('PT_BR'); a URL do site
// usa a forma BCP-47 ('pt-BR'). Sao vocabularios diferentes de
// proposito -- o de dentro pode mudar sem quebrar link nenhum -- entao
// a traducao entre os dois fica explicita aqui, num mapa so.
const SEGMENTO_IDIOMA: Record<Idioma, string> = {
  PT: 'pt',
  PT_BR: 'pt-BR',
  EN: 'en',
  IT: 'it',
  ES: 'es',
  FR: 'fr',
};

// Os quatro caminhos, na ordem em que aparecem na tela.
export type PaginaLegal = 'privacy' | 'terms' | 'cookies' | 'legal';

export const PAGINAS_LEGAIS: PaginaLegal[] = ['privacy', 'terms', 'cookies', 'legal'];

const ROTULOS: Record<Idioma, Record<PaginaLegal, string>> = {
  PT_BR: {
    privacy: 'Política de Privacidade',
    terms: 'Termo de Uso',
    cookies: 'Política de Cookies',
    legal: 'Informações Legais',
  },
  PT: {
    privacy: 'Política de Privacidade',
    terms: 'Termos de Utilização',
    cookies: 'Política de Cookies',
    legal: 'Informações Legais',
  },
  EN: {
    privacy: 'Privacy Policy',
    terms: 'Terms of Use',
    cookies: 'Cookie Policy',
    legal: 'Legal Information',
  },
  ES: {
    privacy: 'Política de Privacidad',
    terms: 'Términos de Uso',
    cookies: 'Política de Cookies',
    legal: 'Información Legal',
  },
  IT: {
    privacy: 'Informativa sulla Privacy',
    terms: 'Termini di Utilizzo',
    cookies: 'Informativa sui Cookie',
    legal: 'Informazioni Legali',
  },
  FR: {
    privacy: 'Politique de Confidentialité',
    terms: "Conditions d'Utilisation",
    cookies: 'Politique relative aux Cookies',
    legal: 'Mentions Légales',
  },
};

// Monta o endereco da pagina no idioma pedido. Idioma desconhecido cai
// no pt-BR em vez de gerar um link quebrado -- o site nao serviria uma
// pagina para um segmento invalido, e um 404 na politica de privacidade
// e' pior do que a politica no idioma errado.
export function urlLegal(pagina: PaginaLegal, idioma: Idioma): string {
  return `${BASE_LEGAL}/${SEGMENTO_IDIOMA[idioma] ?? SEGMENTO_IDIOMA.PT_BR}/${pagina}`;
}

// Rotulo do link no idioma pedido, com o mesmo fallback do urlLegal.
export function rotuloLegal(pagina: PaginaLegal, idioma: Idioma): string {
  return ROTULOS[idioma]?.[pagina] ?? ROTULOS.PT_BR[pagina];
}
