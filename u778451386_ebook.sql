-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Tempo de geração: 10/09/2026 às 20:47
-- Versão do servidor: 11.8.9-MariaDB-log
-- Versão do PHP: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `u778451386_ebook`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `acervos`
--

CREATE TABLE `acervos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `descricao` text DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `acervos`
--

INSERT INTO `acervos` (`id`, `nome`, `descricao`, `status`, `created_at`) VALUES
(1, 'Acervo Digital - Biblioteca M&oacute;vel', 'A Biblioteca Móvel é uma inédita e revolucionária tecnologia educacional, desenvolvida pela Globaltec Tecnologias Educacionais Ltda. Com o suporte de especialistas em Biblioteconomia, Pedagogia, Tecnologias da Informação e Comunicação, para oferecer ao estudante acesso ao conhecimento educacional, cultural, inclusivo e tecnológico. A Biblioteca Móvel é um equipamento educacional e cultural versátil, autônomo e inclusivo. Seu sistema de rodízios, lhe permite criar sua própria espacialidade, adaptando-se aos ambientes existentes e disponíveis nas escolas, dispensando, assim, construção predial para sua instalação e funcionamento. A Biblioteca Móvel é uma biblioteca cadastrada no Conselho Federal de Biblioteconomia, validada pelo Ministério da Educação, certificada pela Confederação Nacional da Indústria – CNI e registrada no Instituto Nacional de Propriedade Industrial – INPI. Este equipamento atende plenamente à Lei 12.244/2010 (Universalização das bibliotecas escolares).', 1, '2025-10-29 14:37:07'),
(2, 'Acervo 2', 'Segundo acervo de livros', 1, '2025-10-29 14:37:07');

-- --------------------------------------------------------

--
-- Estrutura para tabela `Autores_jogo`
--

CREATE TABLE `Autores_jogo` (
  `author_id` int(11) NOT NULL,
  `author_name` varchar(255) NOT NULL,
  `author_image` varchar(255) NOT NULL,
  `author_description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `Autores_jogo`
--

INSERT INTO `Autores_jogo` (`author_id`, `author_name`, `author_image`, `author_description`) VALUES
(5, 'Coquinhos', '54673_imagem_2025-03-27_112412211.jpg', '<p>Jogos interativos para crianças, abordando matérias como português, matemática, ciências, história e geografia. Interface simples, colorida e amigável para o uso em sala de aula ou em casa.</p>'),
(6, 'Ludo Educativo', '99759_imagem_2025-03-26_103113337.jpg', '<p>O <strong>Ludo Educativo</strong> é uma plataforma brasileira de jogos digitais voltados para a educação, desenvolvida com o objetivo de <strong>ensinar de forma lúdica, interativa e gratuita</strong>. Os jogos são projetados para complementar o conteúdo escolar, promovendo o aprendizado por meio da experimentação, curiosidade e diversão.</p>');

-- --------------------------------------------------------

--
-- Estrutura para tabela `Autores_site`
--

CREATE TABLE `Autores_site` (
  `author_id` int(11) NOT NULL,
  `author_name` varchar(255) NOT NULL,
  `author_image` varchar(255) NOT NULL,
  `author_description` longtext NOT NULL,
  `a_status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `Autores_site`
--

INSERT INTO `Autores_site` (`author_id`, `author_name`, `author_image`, `author_description`, `a_status`) VALUES
(4, 'Nasa', '36508_imagem_2025-02-28_153218039.png', '&lt;p&gt;Administra&ccedil;&atilde;o Nacional da Aeron&aacute;utica e Espa&ccedil;o &eacute; uma ag&ecirc;ncia do governo federal dos Estados Unidos respons&aacute;vel pela pesquisa e desenvolvimento de tecnologias e programas de explora&ccedil;&atilde;o espacial. Sua miss&atilde;o oficial &eacute; &quot;fomentar o futuro na pesquisa, descoberta e explora&ccedil;&atilde;o espacial&quot;.&lt;/p&gt;', 1),
(6, 'Vertismed', '36652_imagem_2025-03-18_104104254.jpg', '&lt;p&gt;O &lt;strong&gt;Vertismed&lt;/strong&gt; &amp;eacute; uma plataforma de educa&amp;ccedil;&amp;atilde;o m&amp;eacute;dica cont&amp;iacute;nua que oferece conte&amp;uacute;dos cient&amp;iacute;ficos exclusivos para profissionais de sa&amp;uacute;de, permitindo-lhes aprimorar seus conhecimentos e impulsionar suas carreiras. Dentre seus recursos, destaca-se o &lt;strong&gt;Atlas 3D&lt;/strong&gt;, uma ferramenta de realidade aumentada que permite a visualiza&amp;ccedil;&amp;atilde;o detalhada de mais de 20 &amp;oacute;rg&amp;atilde;os e sistemas do corpo humano em formato tridimensional. Essa funcionalidade auxilia tanto no aprendizado anat&amp;ocirc;mico quanto na comunica&amp;ccedil;&amp;atilde;o entre m&amp;eacute;dicos e pacientes, facilitando a explica&amp;ccedil;&amp;atilde;o de condi&amp;ccedil;&amp;otilde;es m&amp;eacute;dicas de forma visual e interativa.&lt;/p&gt;\\\\r\\\\n', 1),
(7, 'IBGE', '3176_imagem_2025-03-18_110505664.jpg', '&lt;p&gt;O Instituto Brasileiro de Geografia e Estat&amp;iacute;stica (IBGE)&amp;nbsp;&lt;strong&gt;&amp;eacute; um instituto p&amp;uacute;blico da administra&amp;ccedil;&amp;atilde;o federal brasileira criado em 1934 e instalado em 1936 com o nome de Instituto Nacional de Estat&amp;iacute;stica&lt;/strong&gt;; seu fundador e grande incentivador foi o estat&amp;iacute;stico M&amp;aacute;rio Augusto Teixeira de Freitas. O nome atual data de 1938.&lt;/p&gt;\\\\r\\\\n', 1),
(8, 'Google', '13853_imagem_2025-03-18_111514089.jpg', '&lt;p&gt;Google LLC &amp;eacute; uma empresa multinacional de softwares e servi&amp;ccedil;os online fundada em 1998 na cidade norte-americana de Menlo Park, que lucra principalmente atrav&amp;eacute;s da publicidade pelo AdWords. A Google &amp;eacute; a principal subsidi&amp;aacute;ria da Alphabet Inc.&lt;/p&gt;\\\\r\\\\n', 1),
(9, 'INOVE', '25679_imagem_2025-03-18_154104020.jpg', '&lt;p&gt;​A &lt;strong&gt;INOVE, s.r.o.&lt;/strong&gt; &amp;eacute; uma empresa dedicada ao desenvolvimento de aplica&amp;ccedil;&amp;otilde;es interativas e educativas, com foco em tornar a astronomia e outras ci&amp;ecirc;ncias mais acess&amp;iacute;veis ao p&amp;uacute;blico em geral. Com sede na Eslov&amp;aacute;quia, a INOVE &amp;eacute; respons&amp;aacute;vel pela cria&amp;ccedil;&amp;atilde;o do &lt;strong&gt;Solar System Scope&lt;/strong&gt;, uma plataforma que oferece visualiza&amp;ccedil;&amp;otilde;es e simula&amp;ccedil;&amp;otilde;es celestiais detalhadas, permitindo aos usu&amp;aacute;rios explorar e interagir com o sistema solar e o espa&amp;ccedil;o sideral.&lt;/p&gt;\\\\r\\\\n', 1),
(10, 'Ciprian Boboc', '32894_imagem_2025-03-18_160036565.jpg', '&lt;p&gt;&lt;strong&gt;Ciprian Boboc&lt;/strong&gt; &amp;eacute; um desenvolvedor de software com mais de 25 anos de experi&amp;ecirc;ncia na &amp;aacute;rea e mais de 15 anos em posi&amp;ccedil;&amp;otilde;es de gest&amp;atilde;o.&lt;/p&gt;\\\\r\\\\n', 1),
(11, 'Fabien Chéreau', '44780_imagem_2025-03-18_161035099.jpg', '&lt;p&gt;Fabien Ch&amp;eacute;reau &amp;eacute; um engenheiro de pesquisa e programador franc&amp;ecirc;s, nascido em 17 de setembro de 1980 em Villefranche-sur-Sa&amp;ocirc;ne, Fran&amp;ccedil;a. Ele &amp;eacute; amplamente reconhecido como o criador do Stellarium, um software livre e de c&amp;oacute;digo aberto que funciona como um planet&amp;aacute;rio virtual, permitindo aos usu&amp;aacute;rios explorar o c&amp;eacute;u noturno com realismo e precis&amp;atilde;o&lt;/p&gt;\\\\r\\\\n', 1),
(12, 'Fundação Getulio Vargas (FGV)', '69276_imagem_2025-03-19_105524096.jpg', '&lt;p&gt;A FGV foi fundada por &lt;strong&gt;Luiz Sim&amp;otilde;es Lopes&lt;/strong&gt;, que tamb&amp;eacute;m atuou como seu primeiro presidente, exercendo o cargo de 1944 at&amp;eacute; 1992&lt;/p&gt;\\\\r\\\\n', 1),
(13, 'Guia Geográfico', '59438_imagem_2025-03-19_110412232.jpg', '&lt;p&gt;&amp;nbsp;&lt;/p&gt;\\\\r\\\\n\\\\r\\\\n&lt;p&gt;O&amp;nbsp;&lt;strong&gt;&lt;a href=\\\\&quot;http://www.guiageografico.com/\\\\&quot;&gt;Guia Geogr&amp;aacute;fico&lt;/a&gt;&lt;/strong&gt;&amp;nbsp;&amp;eacute; um projeto em para mostrar o mundo em imagens. Um guia educativo com temas culturais, ecol&amp;oacute;gicos, esportivos, e &amp;ecirc;nfase nas componentes geogr&amp;aacute;ficas desses temas. &amp;Eacute; formado por uma rede de web sites e sua consulta &amp;eacute; completamente gratuita.&lt;/p&gt;\\\\r\\\\n', 1),
(14, 'Laboratório de Estudos de Cartografia Histórica (LECH)', '89863_imagem_2025-03-19_111659381.jpg', '&lt;p&gt;&lt;strong&gt;C&amp;aacute;tedra Jaime Cortes&amp;atilde;o, FFLCH-USP&lt;/strong&gt;&lt;br /&gt;\\\\r\\\\nO LECH &amp;eacute; um grupo de pesquisa vinculado &amp;agrave; Faculdade de Filosofia, Letras e Ci&amp;ecirc;ncias Humanas da Universidade de S&amp;atilde;o Paulo (USP), especializado na preserva&amp;ccedil;&amp;atilde;o, estudo e difus&amp;atilde;o de documentos cartogr&amp;aacute;ficos hist&amp;oacute;ricos. O laborat&amp;oacute;rio trabalha na digitaliza&amp;ccedil;&amp;atilde;o e cataloga&amp;ccedil;&amp;atilde;o de mapas antigos, promovendo o acesso a essas fontes para pesquisadores, historiadores e o p&amp;uacute;blico geral. O projeto conta com o apoio do Centro de Tecnologia da Informa&amp;ccedil;&amp;atilde;o de S&amp;atilde;o Carlos (CeTI-SC/USP) e da Funda&amp;ccedil;&amp;atilde;o de Amparo &amp;agrave; Pesquisa do Estado de S&amp;atilde;o Paulo (FAPESP).&lt;/p&gt;\\\\r\\\\n', 1),
(15, 'Desconhecido', '68871_imagem_2025-03-19_144928865.jpg', '<p>teste</p>', 1),
(16, 'National Centers for Environmental Information', '3438_imagem_2025-03-19_150528565.jpg', '<p>uma divisão da National Oceanic and Atmospheric Administration (NOAA) dos Estados Unidos. O NCEI é responsável por monitorar e analisar dados ambientais, fornecendo informações cruciais para a compreensão e mitigação de desastres naturais, incluindo tsunamis.</p>', 1),
(17, 'DEC Development Data Group', '81462_imagem_2025-03-19_151003448.jpg', '<p>O Banco Mundial é uma organização financeira internacional fundada em 1944, com sede em Washington, D.C., nos Estados Unidos. Seu principal objetivo é fornecer financiamento e assistência técnica a países em desenvolvimento, promovendo o crescimento econômico sustentável e a redução da pobreza global. A instituição trabalha em diversas áreas, incluindo educação, infraestrutura, meio ambiente e desenvolvimento social, utilizando dados e pesquisas para embasar políticas públicas e estratégias de desenvolvimento.</p>', 1),
(18, 'Hudson Institute of Mineralogy', '73858_imagem_2025-03-19_152136074.jpg', '<p>O Hudson Institute of Mineralogy é uma entidade educacional, cultural e de pesquisa sem fins lucrativos fundada em 2003. O Instituto se candidatou ao Internal Revenue Service como uma organização isenta de impostos sob a seção 501(c)(3) do Internal Revenue Code. Este pedido foi aprovado em 2004 e, como tal, as doações ao Instituto são dedutíveis de impostos na extensão máxima permitida por lei.</p>', 1),
(19, 'O Instituto Nacional de Pesquisas Espaciais (INPE)', '30407_imagem_2025-03-19_153529839.jpg', '<p>É um instituto federal brasileiro dedicado à pesquisa e exploração espacial, criado em 1961 e sediado em São José dos Campos, São Paulo. O INPE realiza pesquisas científicas e desenvolve tecnologias nas áreas de ciência espacial, atmosfera, meteorologia, engenharia e tecnologia espacial, buscando influenciar positivamente a qualidade de vida da população brasileira e o desenvolvimento do país. O Centro de Previsão de Tempo e Estudos Climáticos (CPTEC), uma das divisões do INPE, é responsável por fornecer previsões numéricas de tempo e clima, monitoramento ambiental e desenvolvimento de tecnologias relacionadas.</p>', 1),
(20, 'Royal Society of Chemistry', '14842_imagem_2025-03-19_161840401.jpg', '<p>Uma organização profissional do Reino Unido dedicada ao avanço das ciências químicas. Fundada em 1841, a RSC promove a excelência na química por meio de publicações, conferências, educação e divulgação científica, servindo como uma plataforma para químicos compartilharem conhecimentos e inovações</p>', 1),
(24, 'U.S. geológico', '68810_imagem_2025-03-19_172449932.jpg', '<p>O autor U.S. geológico levantamento é responsável por este site, oferecendo conteúdo relevante na área. Esta plataforma digital foi desenvolvida para compartilhar informações, recursos e conhecimentos com os usuários. O autor ou organização mantém este portal atualizado com informações úteis e relevantes para o público interessado neste tema. Para mais detalhes sobre o autor, visite a página \\\"Sobre\\\" do site ou entre em contato diretamente através dos canais disponíveis na plataforma.</p>', 1),
(25, 'U.S. geológico levantamento', '36508_imagem_2025-02-28_153218039.png', 'U.S. geológico levantamento é um autor, desenvolvedor ou organização reconhecida em sua área de atuação. Com vasta experiência e conhecimento, U.S. geológico levantamento tem contribuído significativamente para o avanço do conhecimento e inovação em seu campo. Sua trajetória é marcada por realizações importantes e um compromisso contínuo com a excelência. Os projetos desenvolvidos por U.S. geológico levantamento são conhecidos por sua qualidade e relevância, atendendo às necessidades de diversos públicos. Através de sua dedicação e visão única, U.S. geológico levantamento continua a inspirar e influenciar positivamente sua comunidade e todos aqueles que entram em contato com seu trabalho.', 1),
(26, 'Cameron Beccario,', '91489_imagem_2025-03-20_153956158.jpg', '<p>Engenheiro de software baseado em Tóquio, Japão. Ele desenvolveu essa plataforma como um <strong>projeto pessoal</strong>, utilizando JavaScript e tecnologias web avançadas.</p>', 1),
(27, 'Instituto Nacional de Meteorologia (INMET)', '76992_imagem_2025-03-20_154804834.jpg', '<p>O <strong>Instituto Nacional de Meteorologia (INMET)</strong> é um órgão do <strong>Ministério da Agricultura e Pecuária</strong> do Brasil, responsável por promover e coordenar atividades relacionadas à produção de informações meteorológicas relevantes. Essas informações visam mitigar riscos e promover o desenvolvimento sustentável do setor agropecuário, a conservação do meio ambiente e a segurança da sociedade brasileira.</p>', 1),
(28, 'SatFlare ', '96024_imagem_2025-03-20_160653786.jpg', '<p>O <strong>SatFlare</strong> é um portal online que oferece aos usuários a capacidade de rastrear em tempo real todos os satélites conhecidos orbitando a Terra, utilizando representações interativas em 2D e 3D. Além disso, o site permite prever passagens de satélites, visualizar suas trajetórias entre as estrelas em um mapa celeste interativo, prever flares de satélites e trânsitos (através do Sol e da Lua), e encontrar os melhores locais para observar esses eventos em um mapa detalhado do Google. Os usuários também podem assistir a vídeos em tempo real com sobreposições de câmeras HD a bordo da Estação Espacial Internacional (ISS), acompanhar reentradas de satélites e outros eventos especiais, juntar-se à comunidade de observadores, postar mensagens e compartilhar comentários e observações.</p>', 1),
(29, 'Meteoblue', '24013_imagem_2025-03-20_163455649.jpg', '<p>Meteoblue é um serviço meteorológico criado na Universidade de Basileia, na Suíça. Em 2006, a Meteoblue foi então fundada como uma empresa spin-off com o objetivo de servir clientes especialmente na área da agricultura, bem como da energia solar e eólica.</p>', 1),
(30, 'creative commons', '92609_imagem_2025-03-20_171619271.jpg', '<p>O <strong>Creative Commons (CC)</strong> é uma organização sem fins lucrativos que oferece um sistema de <strong>licenciamento aberto</strong> para que criadores de conteúdo possam compartilhar suas obras de maneira legal e flexível. O objetivo do <strong>CC</strong> é promover o <strong>acesso ao conhecimento, cultura e inovação</strong>, permitindo que autores escolham como desejam distribuir seus trabalhos sem abrir mão de seus direitos.</p>', 1),
(31, 'Global Biodiversity Information Facility (GBIF)', '50039_imagem_2025-03-20_173114191.jpg', '<p>É uma <a href=\"https://pt.wikipedia.org/wiki/Organiza%C3%A7%C3%A3o_internacional\" rel=\"nofollow noreferrer noopener\" target=\"_blank\">organização internacional</a> dedicada à disponibilização de dados científicos de <a href=\"https://pt.wikipedia.org/wiki/Biodiversidade\" rel=\"nofollow noreferrer noopener\" target=\"_blank\">biodiversidade</a> por intermédio da <a href=\"https://pt.wikipedia.org/wiki/Internet\" rel=\"nofollow noreferrer noopener\" target=\"_blank\">Internet</a> utilizando <a href=\"https://pt.wikipedia.org/wiki/Web_service\" rel=\"nofollow noreferrer noopener\" target=\"_blank\">web services</a>. Os dados são disponibilizados por muitas instituições de todo o mundo; a arquitectura de informação do GBIF torna estes dados acessíveis e pesquisáveis por meio de um único portal. Os dados disponíveis por meio do portal do GBIF são dados de distribuição primários de plantas, animais, fungos e micróbios, e dados de nomes científicos.</p>', 1),
(32, 'iNaturalist ', '70514_imagem_2025-03-20_173638694.jpg', '<p>O iNaturalist é um projeto colaborativo iniciado em 2008 por estudantes de pós-graduação da Universidade da Califórnia em Berkeley. Atualmente, é administrado em parceria com a Academia de Ciências da Califórnia e a National Geographic Society, organizações dedicadas à pesquisa e educação científica.</p>', 1),
(33, 'Max Planck de Comportamento Animal', '84216_imagem_2025-03-20_184712543.jpg', '<p>O <strong>Instituto Max Planck de Comportamento Animal</strong> é uma instituição de pesquisa de renome internacional dedicada ao estudo quantitativo e preditivo das decisões e movimentos dos animais em seu ambiente natural. Localizado na Alemanha, o instituto adota uma abordagem integrativa que combina perspectivas fisiológicas, neurais, ecológicas e evolutivas para compreender o comportamento animal. ​</p>', 1),
(34, 'Centro de Comércio Internacional (ITC)', '76133_imagem_2025-03-21_093158140.jpg', '<p>Uma agência conjunta da <strong>Organização Mundial do Comércio (OMC)</strong> e das <strong>Nações Unidas (ONU)</strong>, dedicada ao desenvolvimento sustentável através do comércio.</p>', 1),
(35, 'Programa Alimentar Mundial', '28922_imagem_2025-03-21_145935992.jpg', '<p>O Programa Alimentar Mundial\\\' é a maior agência humanitária do mundo, que fornece em média, a cada ano, alimentos a 90 milhões de pessoas em 80 países, incluindo 58 milhões de crianças. O PAM é a agência de auxílio alimentar da Organização das Nações Unidas.</p>', 1),
(36, 'Organização Mundial da Saúde (OMS)', '84107_imagem_2025-03-21_095150791.jpg', '<p>Organização Mundial da Saúde é uma agência especializada em saúde, fundada em 7 de abril de 1948 e subordinada à Organização das Nações Unidas. Sua sede é em Genebra, na Suíça. O diretor-geral é, desde julho de 2017, o etíope Tedros Adhanom. A OMS tem suas origens nas guerras do fim do século XIX</p>', 1),
(37, 'Programa das Nações Unidas para o Desenvolvimento', '74773_imagem_2025-03-21_145917834.jpg', '<p>O Programa das Nações Unidas para o Desenvolvimento é o órgão da Organização das Nações Unidas que tem por mandato promover o desenvolvimento e erradicar a pobreza no mundo.</p>', 1),
(38, 'National Geographic Society', '24243_imagem_2025-03-21_145756107.jpg', '<p>A National Geographic Society é uma organização sem fins lucrativos que visa explorar e proteger o planeta. A organização financia projetos de conservação, publica a revista National Geographic e tem um canal de televisão</p>', 1),
(39, 'Earth Microbiome Project', '39799_imagem_2025-03-21_150917120.jpg', '<p>O Earth Microbiome Project é uma colaboração global que envolve mais de 500 investigadores de diversas instituições, exemplificando a ciência aberta e o compartilhamento de dados pré-publicação. </p>', 1),
(40, 'CIAAW ', '36718_imagem_2025-03-21_152840338.jpg', '<p>A <strong>CIAAW</strong> é uma comissão oficial da <strong>IUPAC</strong> (União Internacional de Química Pura e Aplicada), composta por especialistas internacionais em química, física e geociências.Ela colabora com universidades, centros de pesquisa, laboratórios nacionais e organizações metrológicas para garantir a <strong>qualidade, precisão e relevância científica</strong> dos dados divulgados.</p>', 1),
(41, 'Museu Britânico', '36900_imagem_2025-03-21_155234426.jpg', '<p>O Museu Britânico localiza-se em Londres e foi fundado em 7 de junho de 1753. A sua coleção permanente inclui peças como a Pedra de Roseta e os frisos do Partenon de Atenas, conhecidos como a coleção de mármores de Elgin, trazidos ao museu por Lord Elgin</p>', 1),
(42, 'MMCA ', '54821_imagem_2025-03-21_160128830.jpg', '<p><strong>O Museu Nacional de Arte Moderna e Contemporânea da Coreia</strong> (MMCA) é um museu de arte contemporânea com quatro filiais em <a href=\"https://en-m-wikipedia-org.translate.goog/wiki/Gwacheon?_x_tr_sl=en&amp;_x_tr_tl=pt&amp;_x_tr_hl=pt&amp;_x_tr_pto=wa\" rel=\"nofollow noreferrer noopener\" target=\"_blank\">Gwacheon</a> , <a href=\"https://en-m-wikipedia-org.translate.goog/wiki/Deoksugung?_x_tr_sl=en&amp;_x_tr_tl=pt&amp;_x_tr_hl=pt&amp;_x_tr_pto=wa\" rel=\"nofollow noreferrer noopener\" target=\"_blank\">Deoksugung</a> , <a href=\"https://en-m-wikipedia-org.translate.goog/wiki/Seoul?_x_tr_sl=en&amp;_x_tr_tl=pt&amp;_x_tr_hl=pt&amp;_x_tr_pto=wa\" rel=\"nofollow noreferrer noopener\" target=\"_blank\">Seul</a> e <a href=\"https://en-m-wikipedia-org.translate.goog/wiki/Cheongju?_x_tr_sl=en&amp;_x_tr_tl=pt&amp;_x_tr_hl=pt&amp;_x_tr_pto=wa\" rel=\"nofollow noreferrer noopener\" target=\"_blank\">Cheongju</a> . O museu foi estabelecido pela primeira vez em 1969 como o único museu de arte nacional no país que acomoda arte moderna e contemporânea da Coreia e arte internacional de diferentes períodos de tempo.</p>', 1),
(43, 'Instituto Smithsonian', '54635_imagem_2025-03-21_162401967.jpg', '<p>O instituto serve como <strong>museu nacional dos Estados Unidos e desenvolve programas de pesquisa em arte, cultura, história e ciências</strong> (Oehser, 1970). Na década de 1970, começou a automação do acesso a suas pesquisas e coleções, que continua a ser seu principal foco no século XXI.</p>', 1),
(44, ' Museu do Louvre', '66182_imagem_2025-03-21_162738820.jpg', '<p>Fundado oficialmente em <strong>1793</strong>, o <strong>Musée du Louvre</strong> é o museu de arte mais visitado do mundo e um dos mais antigos em atividade contínua. Ele está localizado no <strong>Palais du Louvre</strong>, um antigo palácio real no coração de Paris. Seu acervo cobre mais de <strong>9 mil anos de história</strong> e abriga <strong>mais de 480 mil obras</strong>.</p>', 1),
(45, 'Museus Vaticanos', '90375_imagem_2025-03-21_163423781.jpg', '<p>O Vaticano <strong>foi fundado em 1929 por meio do chamado de Tratado de Latrão, feito entre a Itália e a Igreja Católica</strong>. A extensão territorial do Vaticano é de apenas 44 hectares, logo este é o menor país do mundo. O nome Vaticano é uma referência a uma formação de colina existente no território de Roma (Itália).</p>', 1),
(46, 'Pinacoteca de São Paulo', '36018_imagem_2025-03-21_172200212.jpg', '<p>A Pinacoteca <strong>é o mais antigo museu de artes plásticas do Estado de São Paulo, inaugurada em 1905 e transformada em museu estadual em 1911</strong>, em um momento em que inexistem salões públicos para a exibição de obras de arte na cidade.</p>', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `Categoría_jogo`
--

CREATE TABLE `Categoría_jogo` (
  `cid` int(11) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `category_image` varchar(255) NOT NULL,
  `cat_status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `Categoría_jogo`
--

INSERT INTO `Categoría_jogo` (`cid`, `category_name`, `category_image`, `cat_status`) VALUES
(5, 'Língua portuguesa', '83105_imagem_2025-03-26_103257037.jpg', 1),
(6, 'Artes', '94948_imagem_2025-03-26_152411566.jpg', 1),
(7, 'Matematica', '74488_imagem_2025-03-26_160633459.jpg', 1),
(8, 'Meio Ambiente', '44426_imagem_2025-03-26_172002338.jpg', 1),
(9, 'Geografia', '51718_imagem_2025-03-26_172546385.jpg', 1),
(10, 'História', '9872_imagem_2025-03-27_082444397.jpg', 1),
(11, 'Ciências ', '60466_imagem_2025-03-27_084855705.jpg', 1),
(12, 'Biologia ', '48810_imagem_2025-03-27_091538495.jpg', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `Categoría_site`
--

CREATE TABLE `Categoría_site` (
  `cid` int(11) NOT NULL,
  `category_name` varchar(50) NOT NULL,
  `category_image` varchar(255) NOT NULL,
  `cat_status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `Categoría_site`
--

INSERT INTO `Categoría_site` (`cid`, `category_name`, `category_image`, `cat_status`) VALUES
(2, 'espaço', '32814_imagem_2025-03-20_170336644.jpg', 1),
(5, 'Mundo', '24727_imagem_2025-03-18_110547722.jpg', 1),
(6, 'Historia', '85402_imagem_2025-03-19_105246849.jpg', 1),
(7, 'Geologia', '42435_imagem_2025-03-19_145231739.jpg', 1),
(14, 'Mapa da Vida', '88225_imagem_2025-03-20_170315065.jpg', 1),
(15, 'Cultura', '85377_imagem_2025-03-21_153423244.jpg', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `Comentarios_jogo`
--

CREATE TABLE `Comentarios_jogo` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_image` varchar(255) NOT NULL,
  `user_type` varchar(50) NOT NULL,
  `comment_text` text NOT NULL,
  `dt_rate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `comment_on` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `Comentarios_site`
--

CREATE TABLE `Comentarios_site` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_type` varchar(255) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_image` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `comment_text` mediumtext NOT NULL,
  `dt_rate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `comment_on` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `Jogos`
--

CREATE TABLE `Jogos` (
  `id` int(11) NOT NULL,
  `cat_id` text NOT NULL,
  `aid` int(11) NOT NULL,
  `featured` int(1) NOT NULL DEFAULT 0,
  `book_title` varchar(255) NOT NULL,
  `book_description` text NOT NULL,
  `book_cover_img` varchar(255) NOT NULL,
  `book_file_type` varchar(255) NOT NULL,
  `book_file_url` text NOT NULL,
  `total_rate` int(11) NOT NULL DEFAULT 0,
  `rate_avg` decimal(11,2) NOT NULL DEFAULT 0.00,
  `book_views` int(11) NOT NULL DEFAULT 0,
  `status` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `Jogos`
--

INSERT INTO `Jogos` (`id`, `cat_id`, `aid`, `featured`, `book_title`, `book_description`, `book_cover_img`, `book_file_type`, `book_file_url`, `total_rate`, `rate_avg`, `book_views`, `status`) VALUES
(18, '5', 6, 0, 'Ludo Primeiros Passos Nível 1 - Portal Ludo Educativo', '<p>Jogo que auxilia na alfabetização, brincando com letras, palavras e sílabas.</p>\n\n<p> </p>', '70885_imagem_2025-03-26_144337295.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/ludo_primeiros_passos_nvel_1__portal_ludo_educativo.html', 0, 0.00, 16, 1),
(19, '5', 6, 0, 'Ludo Primeiros Passos Nível 2', '<p>Jogo que auxilia na alfabetização, brincando com letras, palavras e sílabas.</p>\n\n<p> </p>', '29140_imagem_2025-03-26_145335595.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/ludo-primeiros-passos-nivel-2.html', 0, 0.00, 4, 1),
(22, '5', 6, 0, 'Ludo Primeiros Passos Nível 3', '<p>Jogo que auxilia na alfabetização, brincando com letras, palavras e sílabas.</p>\n\n<p> </p>', '47535_ludo-primeiros-passos-nivel-3.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/ludo-primeiros-passos-nivel-3.html', 0, 0.00, 2, 1),
(23, '5', 6, 0, 'Ludo Primeiros Passos Nível 4', '<p>Jogo que auxilia na alfabetização, brincando com letras, palavras e sílabas.</p>\n\n<p> </p>', '44000_ludo-primeiros-passos-nivel-4.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/ludo-primeiros-passos-nivel-4.html', 0, 0.00, 2, 1),
(24, '5', 6, 0, 'Ludo Primeiros Passos Nível 5', '<p>Jogo que auxilia na alfabetização, brincando com letras, palavras e sílabas.</p>\n\n<p> </p>', '95542_ludo-primeiros-passos-nivel-5.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/ludo-primeiros-passos-nivel-5.html', 0, 0.00, 1, 1),
(25, '5', 6, 0, 'AlfaBeta Heroi', '<p>Venha ajudar a Alfa Heroína a corrigir as palavras alteradas pelo malvado Greeny!</p>\n\n<p> </p>\n\n<p>AlfaBeta Herói é um jogo de Português focado nos erros mais comuns da Língua Portuguesa.</p>\n\n<p>O jogo começa com um vilão alterando todas as palavras em placas e letreiros de uma cidade. Mal sabia ele que nessa mesma cidade vivia a Alfa Heroína!</p>\n\n<p>Com a ajuda do jogador, ela tentará ativar seu Robô Gigante, para corrigir todas as palavras que foram alteradas pelo vilão. Para isso, o jogador deverá identificar as palavras alteradas/erradas e apenas ligar as partes do Robô que não estiverem danificadas.</p>\n\n<p>O jogo conta com mais de 160 palavras em diversas categorias!</p>', '6427_alfabeta-heroi.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/alfabeta-heroi.html', 0, 0.00, 3, 1),
(26, '5', 6, 0, 'No Ritmo das Palavras', '<p>Jogo sobre sinônimos e antônimos</p>\n\n<p>No ritmo das palavras é um jogo sobre Sinônimos e Antônimos e a dança típica brasileira Frevo. Dois personagens dançam de acordo com a missão passada: o jogador deve associar sinônimos se suas roupas são da mesma cor, o jogador deve associar antônimos se suas roupas são de cores diferentes. Caso o jogador erre, perde uma sombrinha típica do frevo e os personagens também errarão os passos da dança. Caso acerte, acumula pontos e os personagens exibem um passo da dança.</p>', '37405_no-ritmo-das-palavras-remake.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/no-ritmo-das-palavras-remake.html', 0, 0.00, 5, 1),
(27, '5', 6, 0, 'Na Trilha do Saci', '<p>Aprenda sobre o folclore usando os \"porquês\"!</p>\n\n<p>Neste divertido jogo o jogador deverá coletar itens de diversas criaturas folclóricas! Para tal o jogador deverá utilizar corretamente os quatro \"porquês\" da língua portuguesa.</p>\n\n<p> </p>', '81983_na-trilha-do-saci.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/na-trilha-do-saci.html', 0, 0.00, 0, 1),
(28, '5', 6, 0, 'Brigadeirolândia', '<p>Forme palavras e alimente o brigadeirolense!</p>\n\n<p>Neste jogo, o objetivo do jogador é zelar para que nunca falte doces para os amistosos habitantes. Para isso deve completar palavras, seguindo as dicas.</p>', '30633_brigadeirolandia.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/brigadeirolandia.html', 0, 0.00, 4, 1),
(29, '6', 6, 0, 'Aventureca', '<p>Jogo de plataforma e de mistura de cores</p>\n\n<p>Jogo de plataforma em que o objetivo é atravessar o nível misturando e absorvendo as cores</p>', '13773_aventureca.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/aventureca.html', 0, 0.00, 0, 1),
(30, '6', 6, 0, 'Memória LudoEducativo', '<p>Venha treinar sua memória e ao mesmo tempo se divertir com os personagens do Ludo Educativo!</p>\n\n<p>Neste novo jogo, você poderá treinar sua memória e se divertir com os mais famosos personagens do Ludo Educativo. O jogo também conta com um modo de desafio por tempo, que consiste em resolver o jogo da memória dentro de um período de tempo.</p>', '45995_memoria-ludoeducativo.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/memoria-ludoeducativo.html', 0, 0.00, 2, 1),
(31, '6', 6, 0, 'Puxe-e-Monte!', '<p>Puxe as peças e monte os animais!</p>\n\n<p> </p>', '30241_puxe-e-monte.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/puxe-e-monte.html', 0, 0.00, 4, 1),
(32, '6', 6, 0, 'O Museu Encantado', '<p>História, Arte, lógica e destreza!</p>\n\n<p>Neste jogo você precisa ajudar o fantasminha a arrumar o Museu após uma festa que os malvados deram... Junto tudo aquilo que sabe de história e arte, suas habilidades de jogador e embarque nessa aventura!</p>', '56155_o-museu-encantado.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/o-museu-encantado.html', 0, 0.00, 15, 1),
(35, '7', 6, 0, 'Resgatinhos', '<p>Ajude a gatinha a reencontrar seus filhotes neste incrível jogo!</p>\n\n<p>O intuito do jogo é ajudar a personagem principal a reencontrar seus filhotes. O plano da gatinha para cumprir esse objetivo é o de acordar seu dono com o cheiro de bolinhos (Cupcakes), para que, então, ele abra a porta da cozinha. Será que você consegue ajuda-la a encontrar todos os ingredientes dos bolinhos e também a preparar os Cupcakes?</p>', '8318_resgatinhos.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/resgatinhos.html', 0, 0.00, 0, 1),
(36, '7', 6, 0, 'LabIncrível', '<p>Ajude os ratinhos a acordarem seus amigos para começar a festa!</p>\n\n<p> </p>\n\n<p>Bem Vindos ao LabIncrível! Quando os cientistas saem do laboratório os ratinhos fazem a festa, mas dessa vez eles precisam da sua ajuda para acordar seus amigos dorminhocos e para isso eles irão utilizar diversas luzes e espelhos encontrados no laboratório. Aprenda um pouco mais sobre reflexão e cores nesses incríveis puzzles.</p>', '34737_labincrivel.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/labincrivel.html', 0, 0.00, 3, 1),
(38, '7', 6, 0, 'Ludo Mix - Ludo Radical - Matemática - 6º ao 9º Ano - 01', '<p>Jogo que ajuda racicioneio e matetica basica</p>', '58506_ludo-radical-matematica.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/55c41794-4c71-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 4, 1),
(39, '7', 6, 0, 'Ludo Mix - Matemática 6º ano - 1º e 2º Bimestres', '<p>Jogo de ludo com matematica, respoda corretamente para avançar as casas</p>', '84414_ludo-mix-matematica-6o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/1a5cdb84-4c7e-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 0, 1),
(40, '7', 6, 0, 'Ludo Mix - Matemática 6º ano - 3º e 4º Bimestres', '<p>Jogo de ludo com matematica, respoda corretamente para avançar as casas</p>', '92529_ludo-mix-matematica-6o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/256e5080-4c7e-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 2, 1),
(41, '7', 6, 0, 'Ludo Mix - Matemática 7º ano - 1º e 2º Bimestres', '<p>Jogo de ludo com matematica, respoda corretamente para avançar as casas</p>', '29686_ludo-mix-matematica-7o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/75ec6570-4c7e-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 2, 1),
(42, '7', 6, 0, 'Ludo Mix - Matemática 7º ano - 3º e 4º Bimestres', '<p>Jogo de ludo com matematica, respoda corretamente para avançar as casas</p>', '43318_ludo-mix-matematica-7o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/827f01db-4c7e-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 4, 1),
(43, '7', 6, 0, 'Ludo Mix - Ludo Radical - Matemática - 6º ao 9º Ano - 02', '<p>Jogo de ludo com matematica, respoda corretamente para avançar as casas</p>', '26200_ludo-radical-matematica.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/60e0c6f4-4c71-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 4, 1),
(44, '7', 6, 0, 'Ludo Mix - Ludo Radical - Matemática - 6º ao 9º Ano - 03', '<p>Jogo de ludo com matematica, respoda corretamente para avançar as casas</p>', '60581_ludo-radical-matematica.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/6e6c5321-4c71-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 3, 1),
(45, '7', 6, 0, 'Ludo Mix - Ludo Radical - Matemática - 6º ao 9º Ano - 04', '<h3>Jogo de ludo com matematica, respoda corretamente para avançar as casas</h3>', '5618_ludo-radical-matematica.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/7da8d9d3-4c71-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 6, 1),
(46, '5', 6, 0, 'Ludo Mix - Língua Portuguesa 6º ano - 1º e 2º Bimestres', '<p>Jogo de ludo com Língua Portuguesa, respoda corretamente para avançar as casas</p>', '25382_ludo-mix-lingua-portuguesa-6o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/3a42fc2c-4c7d-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 3, 1),
(47, '5', 6, 0, 'Ludo Mix - Língua Portuguesa 6º ano - 3º e 4º Bimestres', '<p>Jogo de ludo com Língua Portuguesa, respoda corretamente para avançar as casas</p>', '69289_ludo-mix-lingua-portuguesa-6o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/3a42fc2c-4c7d-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 0, 1),
(48, '5', 6, 0, 'Ludo Mix - Língua Portuguesa 7º ano - 1º e 2º Bimestres', '<p>Jogo de ludo com Língua Portuguesa, respoda corretamente para avançar as casas</p>', '33276_ludo-mix-lingua-portuguesa-7o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/c758d894-4c7d-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 8, 1),
(49, '5', 6, 0, 'Ludo Mix - Língua Portuguesa 7º ano - 3º e 4º Bimestres', '<p>Jogo de ludo com Língua Portuguesa, respoda corretamente para avançar as casas</p>', '39934_ludo-mix-lingua-portuguesa-7o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/d3e563e5-4c7d-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 48, 1),
(50, '8', 6, 0, 'EcoCasa', '<p>Aprenda métodos eficientes de economia de água com este jogo!</p>\n\n<p>Jogo que auxilia na economia de água, mostrando ações de desperdício no dia a dia de uma casa.</p>', '13867_ecocasa-remake.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/ecocasa-remake.html', 0, 0.00, 1, 1),
(51, '8', 6, 0, 'Feijotrânsito', '<p>Ajude a melhorar o trânsito de Feijoville e torne os feijovillenses pessoas mais felizes!</p>\n\n<p>Neste jogo de mobilidade urbana o jogador toma o papel de um secretário de trânsito ou uma secretária de trânsito. O jogador assume então as responsabilidades de resolver os problemas do trânsito de Feijoville, como engarrafamentos e poluição. Para isso o jogador deverá combinar veículos de mesma cor, utilizando ao máximo a capacidade dos veículos. O leal assistente Godofredo auxiliará o jogador em sua nobre missão, a cada novo desafio vencido o jogador obtém novos recursos para investir no trânsito de Feijoville!</p>', '32029_feijotransito.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/feijotransito.html', 0, 0.00, 0, 1),
(52, '8', 6, 0, 'Mergulho Marinho', '<p>Despolua os mares pescando lixo para melhorar o habitat dos peixes.</p>\n\n<p> </p>', '60804_mergulho-marinho.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/mergulho-marinho.html', 0, 0.00, 0, 1),
(53, '8', 6, 0, 'Quebra-Cabeça da Água', '<p>Aprenda como usar água sem desperdiçar através destes quebra-cabeças!</p>\n\n<p> </p>', '36422_quebra-cabeca-da-agua.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/quebra-cabeca-da-agua.html', 0, 0.00, 0, 1),
(54, '8', 6, 0, 'EcoAqua', '<p>Ajude os Koshis a economizar água na hora do banho.</p>\n\n<p>Você precisa garantir que o banho dos Koshis não use muita água, para isso desligue o chuveiro quando não precisar dele.</p>\n\n<p>EcoAqua foi desenvolvido com o objetivo de ensinar crianças, jovens e adultos sobre a importância do recurso natural esgotável mais importante que possuímos, a água.</p>', '20175_ecoaqua.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/ecoaqua.html', 0, 0.00, 1, 1),
(55, '8', 6, 0, 'Jogo da sustentabilidade', '<p>Jogue e aprenda a reciclar o lixo brincando.</p>\n\n<p> </p>', '24482_jogo-da-sustentabilidade.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/jogo-da-sustentabilidade.html', 0, 0.00, 3, 1),
(56, '8', 6, 0, 'Acesso Belíssimo', '<p>Torne-se o secretário de acessibilidade de Feijoville e garanta que todos os pedestres consigam se locomover pelas ruas das diversas áreas da cidade!</p>\n\n<p>Nesta aventura você controlará o novo secretário ou secretária responsável por garantir o acesso dos Feijovillenses a qualquer ponto de sua cidade, a amada Feijoville. Com a ajuda do Godofredo você passará desde o perímetro rural até o centro metropolitano garantindo a construção de rampas de acesso em diversos pontos da cidade. Além disso, para ter sucesso em sua empreitada, você deverá também estar atento as necessidades específicas de cada cidadão, fornecendo pisos táteis, consertando calçadas e movendo árvores para garantir o livre movimento dos pedestres.</p>', '69284_acesso-belissimo.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/acesso-belissimo.html', 0, 0.00, 4, 1),
(57, '9', 6, 0, 'Ludo Mix - Ludo Radical - Geografia - 6º ao 9º Ano - 01', '<p>Jogo de ludo com geografia, respoda corretamente para avançar as casas</p>', '39457_ludo-radical-geografia.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/97d08966-4c74-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 0, 1),
(58, '9', 6, 0, 'Ludo Mix - Ludo Radical - Geografia - 6º ao 9º Ano - 02', '<p>Jogo de ludo com Geografia, respoda corretamente para avançar as casas</p>', '42595_ludo-radical-geografia.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/a4ec3032-4c74-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 2, 1),
(59, '9', 6, 0, 'Ludo Mix - Ludo Radical - Geografia - 6º ao 9º Ano - 03', '<p>Jogo de ludo com Geografia, respoda corretamente para avançar as casas</p>', '12432_ludo-radical-geografia.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/a4ec3032-4c74-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 0, 1),
(60, '9', 6, 0, 'Ludo Mix - Ludo Radical - Geografia - 6º ao 9º Ano - 04', '<p>Jogo de ludo com Geografia, respoda corretamente para avançar as casas</p>', '83707_ludo-radical-geografia.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/bf2f5924-4c74-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 0, 1),
(61, '9', 6, 0, 'Ludo Mix - Geografia 6º ano - 1º e 2º Bimestres', '<p>Jogo de ludo com Geografia, respoda corretamente para avançar as casas</p>', '6816_ludo-mix-geografia-6o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/44b04908-4c79-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 2, 1),
(62, '9', 6, 0, 'Ludo Mix - Geografia 6º ano - 3º e 4º Bimestres', '<h3>Ludo Mix - Geografia 6º ano - 3º e 4º Bimestres</h3>', '20034_ludo-mix-geografia-6o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/51bae9c6-4c79-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 0, 1),
(63, '9', 6, 0, 'Ludo Mix - Geografia 7º ano - 1º e 2º Bimestres', '<p>Jogo de ludo com Geografia, respoda corretamente para avançar as casas</p>', '58070_ludo-mix-geografia-7o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/ba3f2da9-4c79-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 6, 1),
(64, '9', 6, 0, 'Ludo Mix - Geografia 7º ano - 3º e 4º Bimestres', '<p>Jogo de ludo com Geografia, respoda corretamente para avançar as casas</p>', '53616_ludo-mix-geografia-7o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/c7909aab-4c79-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 4, 1),
(65, '10', 6, 0, 'Linha do tempo - Roma', '<p>Ajude a organizar os eventos da linha do tempo em Roma!</p>\n\n<p>Linha do tempo - Roma é um jogo de até três jogadores com o objetivo de organizar eventos acontecidos na Roma antiga.</p>\n\n<p>Para isso os jogadores poderão ver, nas cartas, figuras relacionadas aos acontecimentos e checar descrições mais detalhadas para que possam arrastar as cartas corretas na linha tempo.</p>', '10515_linha-do-tempo-roma.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/linha-do-tempo-roma.html', 0, 0.00, 0, 1),
(66, '10', 6, 0, 'Ludo Mix - História 6º ano - 1º e 2º Bimestres', '<p>Jogo de ludo com História, respoda corretamente para avançar as casas</p>', '42898_ludo-mix-historia-6o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/2310b76b-4c7a-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 3, 1),
(67, '10', 6, 0, 'Ludo Mix - História 6º ano - 3º e 4º Bimestres', '<p>Jogo de ludo com História, respoda corretamente para avançar as casas</p>', '68734_ludo-mix-historia-6o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/30ad837c-4c7a-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 0, 1),
(68, '10', 6, 0, 'Ludo Mix - História 7º ano - 1º e 2º Bimestres', '<h3>Jogo de ludo com História, respoda corretamente para avançar as casas</h3>', '85930_ludo-mix-historia-7o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/adb20832-4c7b-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 0, 1),
(69, '10', 6, 0, 'Ludo Mix - História 7º ano - 3º e 4º Bimestres', '<p>Jogo de ludo com História, respoda corretamente para avançar as casas</p>', '85365_ludo-mix-historia-7o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/c165b095-4c7b-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 0, 1),
(70, '10', 6, 0, 'Ludo Mix - Ludo Radical - História - 6º ao 9º Ano - 01', '<p>Jogo de ludo com História, respoda corretamente para avançar as casas</p>', '41058_ludo-radical-historia.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/b3347bb6-4c71-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 0, 1),
(71, '10', 6, 0, 'Ludo Mix - Ludo Radical - História - 6º ao 9º Ano - 02', '<p>Jogo de ludo com História, respoda corretamente para avançar as casas</p>', '62114_ludo-radical-historia.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/bfc06590-4c71-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 0, 1),
(72, '10', 6, 0, 'Ludo Mix - Ludo Radical - História - 6º ao 9º Ano - 03', '<p>Jogo de ludo com História, respoda corretamente para avançar as casas</p>', '53577_ludo-radical-historia.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/20809759-4c74-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 2, 1),
(73, '10', 6, 0, 'Ludo Mix - Ludo Radical - História - 6º ao 9º Ano - 04', '<p>Jogo de ludo com História, respoda corretamente para avançar as casas</p>', '59388_ludo-radical-historia.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/2cbde4db-4c74-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 3, 1),
(74, '10', 6, 0, 'Ludo Mix - Ludo Radical - História - 6º ao 9º Ano - 05', '<p>Prepare-se para uma aventura divertida onde conhecimento é a chave para a vitória!<br />\\nNo <strong>Jogo de Ludo com História</strong>, cada jogada vai além da sorte: para avançar no tabuleiro, você precisa mostrar que está por dentro dos acontecimentos e personagens que marcaram o passado.</p>\\n\\n<p>Responda perguntas de história corretamente, desafie seus amigos e descubra curiosidades enquanto se move pelas casas. Aprender nunca foi tão empolgante!</p>\\n\\n<p><strong>Gire o dado, teste seus conhecimentos e chegue ao final como um verdadeiro mestre da História!</strong></p>', '62614_ludo-radical-historia.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/3799d9ec-4c74-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 9, 1),
(75, '11', 6, 0, 'Elementar', '<p>Venha descobrir os elementos e seus grupos!</p>\n\n<p>Venha para o laboratório e preencha sua tabela periódica, descubra os elementos jogando puyo-puyo e troque os repetidos com seus amigos! Libere os grupos para que possa ver seus vídeos especiais!</p>', '64622_elementar.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/elementar.html', 0, 0.00, 1, 1),
(76, '11', 6, 0, 'Vacinax - Segunda dose', '<p>Mergulhe em um universo microscópico onde você assume o papel de uma célula protetora de elite! Sua missão? Patrulhar os sistemas vivos em busca de agentes instáveis e restaurar o equilíbrio vital.</p>', '16511_vacinax-segunda-dose.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/vacinax-segunda-dose.html', 0, 0.00, 0, 1),
(77, '11', 6, 0, 'Primo Tesla', '<p>A nave espacial de Zelig caiu na fazenda do Primo Tesla e do Primo Faradei. É preciso ajudar a consertar a nave do nosso amigo.</p>\n\n<p>Zelig tem um problema! A nave de nosso amiguinho caiu na Terra, na fazenda dos ratinhos Faradei e Tesla. Ajude Tesla a consertar os circuitos elétricos da nave do amigável alienígena.</p>', '13484_primo-tesla.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/primo-tesla.html', 0, 0.00, 1, 1),
(78, '11', 6, 0, '7 Erros - Contra a Dengue 2', '<p>Entre na missão de combate ao Aedes aegypti com o olhar de um verdadeiro agente da saúde!<br />\nEm <strong>“Ache os 7 Erros – Contra Dengue 2”</strong>, você deve observar com atenção duas cenas aparentemente iguais e identificar pequenas diferenças que revelam comportamentos e situações de risco para a proliferação do mosquito da dengue.</p>\n\n<p>Além de desafiar sua percepção visual, o jogo também ensina atitudes simples e essenciais para manter sua casa e sua comunidade protegidas.<br />\nSerá que você consegue encontrar todos os erros e se tornar um verdadeiro defensor da saúde?</p>\n\n<p><strong>Aguce seu olhar. Aprenda brincando. Junte-se ao combate!</strong></p>', '23044_7-erros-contra-a-dengue-2.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/7-erros-contra-a-dengue-2.html', 0, 0.00, 0, 1),
(79, '11', 6, 0, 'Ludo Mix - Ciências 6º ano - 1º e 2º Bimestres', '<p>Prepare-se para uma aventura divertida onde conhecimento é a chave para a vitória!<br />\nNo <strong>Jogo de Ludo com Ciências</strong>, cada jogada vai além da sorte: para avançar no tabuleiro, você precisa mostrar que está por dentro dos acontecimentos e personagens que marcaram o passado.</p>\n\n<p>Responda perguntas de história corretamente, desafie seus amigos e descubra curiosidades enquanto se move pelas casas. Aprender nunca foi tão empolgante!</p>\n\n<p><strong>Gire o dado, teste seus conhecimentos e chegue ao final como um verdadeiro mestre da Ciências!</strong></p>', '53621_ludo-mix-ciencias-6o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/a1f387c3-4c76-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 2, 1),
(80, '11', 6, 0, 'Ludo Mix - Ciências 6º ano - 3º e 4º Bimestres', '<p>Prepare-se para uma aventura divertida onde conhecimento é a chave para a vitória!<br />\nNo <strong>Jogo de Ludo com Ciências</strong>, cada jogada vai além da sorte: para avançar no tabuleiro, você precisa mostrar que está por dentro dos acontecimentos e personagens que marcaram o passado.</p>\n\n<p>Responda perguntas de história corretamente, desafie seus amigos e descubra curiosidades enquanto se move pelas casas. Aprender nunca foi tão empolgante!</p>\n\n<p><strong>Gire o dado, teste seus conhecimentos e chegue ao final como um verdadeiro mestre da Ciências!</strong></p>', '55825_ludo-mix-ciencias-6o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/b0bd8966-4c76-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 0, 1),
(81, '11', 6, 0, 'Ludo Mix - Ciências 7º ano - 1º e 2º Bimestres', '<p>Prepare-se para uma aventura divertida onde conhecimento é a chave para a vitória!<br />\nNo <strong>Jogo de Ludo com Ciências</strong>, cada jogada vai além da sorte: para avançar no tabuleiro, você precisa mostrar que está por dentro dos acontecimentos e personagens que marcaram o passado.</p>\n\n<p>Responda perguntas de história corretamente, desafie seus amigos e descubra curiosidades enquanto se move pelas casas. Aprender nunca foi tão empolgante!</p>\n\n<p><strong>Gire o dado, teste seus conhecimentos e chegue ao final como um verdadeiro mestre da Ciências!</strong></p>', '46325_ludo-mix-ciencias-7o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/2174509d-4c78-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 1, 1),
(82, '11', 6, 0, 'Ludo Mix - Ciências 7º ano - 3º e 4º Bimestres', '<p>Prepare-se para uma aventura divertida onde conhecimento é a chave para a vitória!<br />\nNo <strong>Jogo de Ludo com Ciências</strong>, cada jogada vai além da sorte: para avançar no tabuleiro, você precisa mostrar que está por dentro dos acontecimentos e personagens que marcaram o passado.</p>\n\n<p>Responda perguntas de história corretamente, desafie seus amigos e descubra curiosidades enquanto se move pelas casas. Aprender nunca foi tão empolgante!</p>\n\n<p><strong>Gire o dado, teste seus conhecimentos e chegue ao final como um verdadeiro mestre da Ciências!</strong></p>', '7458_ludo-mix-ciencias-7o-ano.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/3305ff1a-4c78-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 0, 1),
(83, '11', 6, 0, 'Ludo Mix - Ludo Radical - Ciências - 6º ao 9º Ano - 01', '<p>Prepare-se para uma aventura divertida onde conhecimento é a chave para a vitória!<br />\nNo <strong>Jogo de Ludo com Ciências</strong>, cada jogada vai além da sorte: para avançar no tabuleiro, você precisa mostrar que está por dentro dos acontecimentos e personagens que marcaram o passado.</p>\n\n<p>Responda perguntas de história corretamente, desafie seus amigos e descubra curiosidades enquanto se move pelas casas. Aprender nunca foi tão empolgante!</p>\n\n<p><strong>Gire o dado, teste seus conhecimentos e chegue ao final como um verdadeiro mestre da Ciências!</strong></p>', '27481_ludo-radical-ciencias.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/cd2e70da-4c70-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 1, 1),
(84, '11', 6, 0, 'Ludo Mix - Ludo Radical - Ciências - 6º ao 9º Ano - 02', '<p>Prepare-se para uma aventura divertida onde conhecimento é a chave para a vitória!<br />\nNo <strong>Jogo de Ludo com Ciências</strong>, cada jogada vai além da sorte: para avançar no tabuleiro, você precisa mostrar que está por dentro dos acontecimentos e personagens que marcaram o passado.</p>\n\n<p>Responda perguntas de história corretamente, desafie seus amigos e descubra curiosidades enquanto se move pelas casas. Aprender nunca foi tão empolgante!</p>\n\n<p><strong>Gire o dado, teste seus conhecimentos e chegue ao final como um verdadeiro mestre da Ciências!</strong></p>', '91663_ludo-radical-ciencias.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/da5c8020-4c70-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 1, 1),
(85, '11', 6, 0, 'Ludo Mix - Ludo Radical - Ciências - 6º ao 9º Ano - 03', '<p>Prepare-se para uma aventura divertida onde conhecimento é a chave para a vitória!<br />\nNo <strong>Jogo de Ludo com Ciências</strong>, cada jogada vai além da sorte: para avançar no tabuleiro, você precisa mostrar que está por dentro dos acontecimentos e personagens que marcaram o passado.</p>\n\n<p>Responda perguntas de história corretamente, desafie seus amigos e descubra curiosidades enquanto se move pelas casas. Aprender nunca foi tão empolgante!</p>\n\n<p><strong>Gire o dado, teste seus conhecimentos e chegue ao final como um verdadeiro mestre da Ciências!</strong></p>', '50807_ludo-radical-ciencias.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/e6d2fab9-4c70-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 6, 1),
(86, '11', 6, 0, 'Ludo Mix - Ludo Radical - Ciências - 6º ao 9º Ano - 04', '<p>Prepare-se para uma aventura divertida onde conhecimento é a chave para a vitória!<br />\\nNo <strong>Jogo de Ludo com Ciências</strong>, cada jogada vai além da sorte: para avançar no tabuleiro, você precisa mostrar que está por dentro dos acontecimentos e personagens que marcaram o passado.</p>\\n\\n<p>Responda perguntas de história corretamente, desafie seus amigos e descubra curiosidades enquanto se move pelas casas. Aprender nunca foi tão empolgante!</p>\\n\\n<p><strong>Gire o dado, teste seus conhecimentos e chegue ao final como um verdadeiro mestre da Ciências!</strong></p>', '2423_ludo-radical-ciencias.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/fc39c963-4c70-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 4, 1),
(87, '11', 6, 0, 'Ludo Mix - Ludo Radical - Ciências - 6º ao 9º Ano - 05', '<p>Prepare-se para uma aventura divertida onde conhecimento é a chave para a vitória!<br />\nNo <strong>Jogo de Ludo com Ciências</strong>, cada jogada vai além da sorte: para avançar no tabuleiro, você precisa mostrar que está por dentro dos acontecimentos e personagens que marcaram o passado.</p>\n\n<p>Responda perguntas de história corretamente, desafie seus amigos e descubra curiosidades enquanto se move pelas casas. Aprender nunca foi tão empolgante!</p>\n\n<p><strong>Gire o dado, teste seus conhecimentos e chegue ao final como um verdadeiro mestre da Ciências!</strong></p>', '12888_ludo-radical-ciencias.jpg', 'server_url', 'https://www.ludoeducativo.com.br/pt/eplay/08e6e8e0-4c71-11e7-b4a2-26d1d03b6bb6', 0, 0.00, 61, 1),
(88, '12', 6, 0, 'Quem Come O Quê', '<p>Venha se divertir nesse incrível jogo de teia alimentar!</p>\n\n<p>Monte várias teias alimentares e vença todas as fases! Entretanto, toda vez que você jogar uma fase será um novo desafio. Tente também o modo de tempo e consiga pontos para entrar no Ranking!</p>\n\n<p> </p>', '36261_quem-come-o-que.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/quem-come-o-que.html', 0, 0.00, 12, 1),
(89, '12', 6, 0, 'Contra Corona', '<p>Ajude o achatamento da curva!</p>\n\n<p>O poder de diminuir o impacto da pandemia do COVID-19 está em suas mãos! Ajude a achatar a curva lavando-as!</p>', '40340_contra-corona.jpg', 'ludo_educativo', 'https://ebook.alenxandriaglobaltec.com/jogos/contra-corona.html', 0, 0.00, 10, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `livros_acervos`
--

CREATE TABLE `livros_acervos` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `acervo_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `livros_acervos`
--

INSERT INTO `livros_acervos` (`id`, `book_id`, `acervo_id`) VALUES
(1, 4, 1),
(398, 5, 1),
(399, 6, 1),
(402, 7, 1),
(403, 8, 1),
(404, 9, 1),
(405, 10, 1),
(406, 11, 1),
(407, 12, 1),
(408, 13, 1),
(389, 14, 1),
(395, 15, 1),
(396, 16, 1),
(391, 17, 1),
(390, 18, 1),
(393, 19, 1),
(342, 20, 1),
(194, 21, 1),
(192, 22, 1),
(179, 23, 1),
(203, 24, 1),
(199, 25, 1),
(43, 26, 1),
(309, 27, 1),
(44, 28, 1),
(41, 29, 1),
(53, 30, 1),
(237, 31, 1),
(175, 32, 1),
(40, 34, 1),
(306, 35, 1),
(48, 36, 1),
(205, 37, 1),
(50, 38, 1),
(51, 39, 1),
(65, 40, 1),
(54, 41, 1),
(55, 42, 1),
(351, 43, 1),
(57, 44, 1),
(58, 45, 1),
(165, 46, 1),
(62, 47, 1),
(397, 48, 1),
(241, 49, 1),
(67, 50, 1),
(206, 51, 1),
(186, 52, 1),
(188, 53, 1),
(363, 54, 1),
(362, 55, 1),
(361, 56, 1),
(360, 57, 1),
(359, 58, 1),
(358, 59, 1),
(357, 60, 1),
(365, 61, 1),
(92, 62, 1),
(372, 63, 1),
(376, 64, 1),
(368, 65, 1),
(366, 66, 1),
(377, 67, 1),
(373, 68, 1),
(353, 69, 1),
(371, 70, 1),
(370, 71, 1),
(364, 72, 1),
(375, 73, 1),
(374, 74, 1),
(369, 75, 1),
(367, 76, 1),
(378, 77, 1),
(164, 78, 1),
(343, 79, 1),
(173, 80, 1),
(379, 81, 1),
(380, 82, 1),
(356, 83, 1),
(355, 84, 1),
(386, 85, 1),
(187, 86, 1),
(354, 87, 1),
(382, 88, 1),
(385, 89, 1),
(384, 90, 1),
(387, 91, 1),
(383, 92, 1),
(381, 93, 1),
(344, 94, 1),
(345, 95, 1),
(136, 96, 1),
(150, 97, 1),
(267, 99, 1),
(268, 100, 1),
(269, 101, 1),
(317, 102, 1),
(313, 103, 1),
(348, 104, 1),
(352, 105, 1),
(177, 106, 1),
(178, 107, 1),
(346, 108, 1),
(189, 109, 1),
(190, 110, 1),
(263, 111, 1),
(347, 112, 1),
(208, 113, 1),
(209, 114, 1),
(244, 115, 1),
(349, 116, 1),
(350, 117, 1),
(388, 118, 1),
(248, 119, 1),
(249, 120, 1),
(250, 121, 1),
(251, 122, 1),
(337, 123, 1),
(332, 124, 1),
(333, 125, 1),
(334, 126, 1),
(335, 127, 1),
(336, 128, 1),
(338, 129, 1),
(265, 130, 1),
(278, 131, 1),
(270, 132, 1),
(271, 133, 1),
(276, 134, 1),
(277, 135, 1),
(274, 136, 1),
(275, 137, 1),
(279, 138, 1),
(282, 139, 1),
(283, 140, 1),
(284, 141, 1),
(286, 142, 1),
(287, 143, 1),
(288, 144, 1),
(293, 145, 1),
(292, 146, 1),
(295, 147, 1),
(296, 148, 1),
(297, 149, 1),
(298, 150, 1),
(299, 151, 1),
(300, 152, 1),
(301, 153, 1),
(302, 154, 1),
(303, 155, 1),
(304, 156, 1),
(305, 157, 1),
(310, 158, 1),
(339, 159, 1),
(312, 160, 1),
(340, 161, 1),
(341, 162, 1),
(316, 163, 1),
(319, 164, 1),
(320, 165, 1),
(321, 166, 1),
(322, 167, 1),
(323, 168, 1),
(324, 169, 1),
(325, 170, 1),
(327, 171, 1),
(328, 172, 1),
(329, 173, 1),
(330, 174, 1),
(401, 175, 1),
(400, 207, 1),
(409, 208, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `rating_jogos`
--

CREATE TABLE `rating_jogos` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rate` int(11) NOT NULL,
  `dt_rate` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `rating_sites`
--

CREATE TABLE `rating_sites` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ip` varchar(40) NOT NULL,
  `rate` int(11) NOT NULL,
  `dt_rate` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `Seções_jogo`
--

CREATE TABLE `Seções_jogo` (
  `id` int(11) NOT NULL,
  `section_title` varchar(255) NOT NULL,
  `section_books` text NOT NULL,
  `status` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `Seções_jogo`
--

INSERT INTO `Seções_jogo` (`id`, `section_title`, `section_books`, `status`) VALUES
(2, 'Serie Ludo Primeiros Passos', '24,23,22,19,18', 1),
(3, 'Serie Ludo Mix Matemática', '45,44,43,42,41,40,39,38', 1),
(4, 'Serie Ludo Mix Língua Portuguesa', '49,48,47,46', 1),
(5, 'Serie Ludo MIX Geografia', '64,63,62,61,60,59,58,57', 1),
(6, 'Serie Ludo MIX História', '74,73,72,71,70,69,68,67,66', 1),
(7, 'Serie Ludo MIX Ciências ', '87,86,85,84,83,82,81,80,79', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `Seções_site`
--

CREATE TABLE `Seções_site` (
  `id` int(10) NOT NULL,
  `section_title` varchar(150) NOT NULL,
  `section_books` longtext NOT NULL,
  `status` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `Seções_site`
--

INSERT INTO `Seções_site` (`id`, `section_title`, `section_books`, `status`) VALUES
(4, ' Exploração Espacial e Astronomia', '18,17,14,13,12,11,10,9,2', 1),
(5, 'Mapas, Atlas e Geografia', '31,28,27,26,8,7', 1),
(6, 'Ciência, Natureza e Biodiversidade', '62,55,54,53,52', 1),
(7, 'Arte, Cultura e Museus', '76,75,74,73,72,71,70,69,68,67,66', 1),
(8, 'Clima, Água e Meio Ambiente', '46,45,40,39,38,37', 1),
(9, 'Dados Globais, Economia e Saúde', '65,59,58,57,56', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `Sites`
--

CREATE TABLE `Sites` (
  `id` int(11) NOT NULL,
  `cat_id` varchar(250) NOT NULL,
  `aid` int(11) NOT NULL,
  `featured` int(1) NOT NULL DEFAULT 0,
  `book_title` varchar(100) NOT NULL,
  `book_description` longtext NOT NULL,
  `book_cover_img` varchar(255) NOT NULL,
  `book_file_type` varchar(255) NOT NULL,
  `book_file_url` varchar(255) NOT NULL,
  `total_rate` int(11) NOT NULL DEFAULT 0,
  `rate_avg` varchar(255) NOT NULL DEFAULT '0',
  `book_views` int(11) NOT NULL DEFAULT 0,
  `status` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `Sites`
--

INSERT INTO `Sites` (`id`, `cat_id`, `aid`, `featured`, `book_title`, `book_description`, `book_cover_img`, `book_file_type`, `book_file_url`, `total_rate`, `rate_avg`, `book_views`, `status`) VALUES
(2, '2', 4, 1, 'Nasa', '&lt;p&gt;O site oficial da NASA (Administra&amp;ccedil;&amp;atilde;o Nacional da Aeron&amp;aacute;utica e Espa&amp;ccedil;o) &amp;eacute; uma fonte abrangente de informa&amp;ccedil;&amp;otilde;es sobre as atividades e miss&amp;otilde;es da ag&amp;ecirc;ncia espacial dos Estados Unidos. Nele, os visitantes podem explorar not&amp;iacute;cias atualizadas, descobrir detalhes sobre miss&amp;otilde;es espaciais, acessar recursos educacionais e aprender sobre as diversas iniciativas de pesquisa cient&amp;iacute;fica e tecnol&amp;oacute;gica da NASA. Al&amp;eacute;m disso, o site oferece conte&amp;uacute;do multim&amp;iacute;dia, incluindo imagens e v&amp;iacute;deos das miss&amp;otilde;es e descobertas mais recentes, permitindo que o p&amp;uacute;blico acompanhe de perto as explora&amp;ccedil;&amp;otilde;es e avan&amp;ccedil;os no campo aeroespacial.&lt;/p&gt;', '71312_imagem_2025-02-28_153441783.png', 'server_url', 'https://www.nasa.gov', 0, '0', 139, 1),
(6, '14', 6, 0, 'Atlas 3D', '<p>O <strong>Atlas 3D</strong> é acessível gratuitamente e pode ser utilizado em diversos dispositivos, como smartphones, laptops e computadores convencionais, adaptando-se às necessidades dos usuários e proporcionando uma experiência de aprendizado imersiva e detalhada.</p>\\n\\n<p>\\\\\\\\r\\\\\\\\n</p>', '26833_imagem_2025-03-18_104211086.jpg', 'server_url', 'https://br.vertismed.com/atlas-3d/', 0, '0', 26, 1),
(7, '5', 7, 0, 'Atlas Escolar Digital do IBGE', '&lt;p&gt;O &lt;strong&gt;Atlas Geogr&amp;aacute;fico Escolar&lt;/strong&gt; &amp;eacute; uma publica&amp;ccedil;&amp;atilde;o do Instituto Brasileiro de Geografia e Estat&amp;iacute;stica (&lt;strong&gt;IBGE&lt;/strong&gt;) que oferece informa&amp;ccedil;&amp;otilde;es geogr&amp;aacute;ficas, estat&amp;iacute;sticas e cartogr&amp;aacute;ficas sobre o Brasil e o mundo. Dispon&amp;iacute;vel em formato digital, o atlas apresenta mapas interativos e ilustra&amp;ccedil;&amp;otilde;es animadas que facilitam o aprendizado de temas relacionados &amp;agrave; geografia e cartografia.&lt;/p&gt;\\\\r\\\\n\\\\r\\\\n&lt;p&gt;O IBGE, respons&amp;aacute;vel pelo desenvolvimento do Atlas Geogr&amp;aacute;fico Escolar, &amp;eacute; o principal provedor de informa&amp;ccedil;&amp;otilde;es geogr&amp;aacute;ficas e estat&amp;iacute;sticas do Brasil, atuando na produ&amp;ccedil;&amp;atilde;o e an&amp;aacute;lise de dados que auxiliam no entendimento das caracter&amp;iacute;sticas territoriais, ambientais, demogr&amp;aacute;ficas e socioecon&amp;ocirc;micas do pa&amp;iacute;s.&amp;nbsp;&lt;/p&gt;\\\\r\\\\n', '46455_imagem_2025-03-18_110809174.jpg', 'server_url', 'https://atlasescolar.ibge.gov.br/atlas.html', 0, '0', 12, 1),
(8, '5', 8, 0, 'Google Maps', '&lt;p&gt;O &lt;strong&gt;Google Maps&lt;/strong&gt; &amp;eacute; um servi&amp;ccedil;o de mapas online desenvolvido pelo &lt;strong&gt;Google&lt;/strong&gt;, que fornece imagens de sat&amp;eacute;lite, mapas detalhados, rotas para diversos tipos de transporte (carro, bicicleta, transporte p&amp;uacute;blico e a p&amp;eacute;) e informa&amp;ccedil;&amp;otilde;es de tr&amp;aacute;fego em tempo real. Ele tamb&amp;eacute;m permite a explora&amp;ccedil;&amp;atilde;o de locais com o recurso &lt;strong&gt;Street View&lt;/strong&gt;, que apresenta imagens panor&amp;acirc;micas de 360&amp;deg; tiradas a partir do n&amp;iacute;vel da rua.&lt;/p&gt;\\r\\n\\r\\n&lt;p&gt;Al&amp;eacute;m da navega&amp;ccedil;&amp;atilde;o e mapas, o Google Maps inclui informa&amp;ccedil;&amp;otilde;es sobre estabelecimentos comerciais, avalia&amp;ccedil;&amp;otilde;es de usu&amp;aacute;rios, hor&amp;aacute;rios de funcionamento e at&amp;eacute; integra&amp;ccedil;&amp;atilde;o com realidade aumentada para navega&amp;ccedil;&amp;atilde;o em dispositivos m&amp;oacute;veis.&lt;/p&gt;\\r\\n\\r\\n&lt;p&gt;O servi&amp;ccedil;o &amp;eacute; amplamente utilizado tanto para uso pessoal quanto para fins empresariais, com APIs que permitem sua integra&amp;ccedil;&amp;atilde;o em sites e aplicativos de terceiros.&lt;/p&gt;', '4044_imagem_2025-03-18_112303393.jpg', 'server_url', 'https://www.google.com.br/maps/', 0, '0', 13, 1),
(9, '2', 4, 0, 'De olho na Terra', '&lt;p&gt;O &lt;strong&gt;De olho na Terra&lt;/strong&gt; &amp;eacute; uma plataforma interativa desenvolvida pela &lt;strong&gt;NASA&lt;/strong&gt; que permite aos usu&amp;aacute;rios acompanhar em tempo real os sinais vitais do nosso planeta. Utilizando modelos 3D, o site oferece uma experi&amp;ecirc;ncia imersiva para visualizar dados sobre mudan&amp;ccedil;as clim&amp;aacute;ticas, desastres naturais e outras informa&amp;ccedil;&amp;otilde;es ambientais coletadas por sat&amp;eacute;lites da NASA&lt;/p&gt;\\r\\n\\r\\n&lt;p&gt;\\\\r\\\\n\\\\r\\\\n&lt;/p&gt;\\r\\n\\r\\n&lt;p&gt;\\\\\\\\\\\\\\\\r\\\\\\\\\\\\\\\\n&lt;/p&gt;', '7658_imagem_2025-03-18_144310444.jpg', 'server_url', 'https://eyes.nasa.gov/apps/earth/#/', 0, '0', 8, 1),
(10, '2,5', 4, 0, 'De olho na Marte', '&lt;p&gt;O De olho na Marte&amp;nbsp;&amp;eacute; uma plataforma interativa desenvolvida pela &lt;strong&gt;NASA&lt;/strong&gt; que permite aos usu&amp;aacute;rios acompanhar em tempo real os sinais vitais de Marte. Utilizando modelos 3D, o site oferece uma experi&amp;ecirc;ncia imersiva para visualizar dados sobre mudan&amp;ccedil;as clim&amp;aacute;ticas, desastres naturais e outras informa&amp;ccedil;&amp;otilde;es ambientais coletadas por sat&amp;eacute;lites da NASA&lt;/p&gt;', '61083_imagem_2025-03-18_145242059.jpg', 'server_url', 'https://eyes.nasa.gov/apps/mars2020/#/home', 0, '0', 3, 1),
(11, '2', 4, 0, 'De olho nos Asteroides', '&lt;p&gt;O &lt;strong&gt;De olho nos Asteroides&lt;/strong&gt; &amp;eacute; uma plataforma interativa desenvolvida pela &lt;strong&gt;NASA&lt;/strong&gt; que permite aos usu&amp;aacute;rios acompanhar em tempo real os sinais vitais do nosso sistema solar. Utilizando modelos 3D, o site oferece uma experi&amp;ecirc;ncia imersiva para visualizar dados sobre mudan&amp;ccedil;as clim&amp;aacute;ticas, desastres naturais e outras informa&amp;ccedil;&amp;otilde;es ambientais coletadas por sat&amp;eacute;lites da NASA&lt;/p&gt;\\\\r\\\\n', '6412_imagem_2025-03-18_145440040.jpg', 'server_url', 'https://eyes.nasa.gov/apps/asteroids/#/home', 0, '0', 7, 1),
(12, '2', 4, 0, 'Olhos nos exoplanetas', '&lt;p&gt;O &lt;strong&gt;Olhos nos exoplanetas&lt;/strong&gt; &amp;eacute; uma plataforma interativa desenvolvida pela &lt;strong&gt;NASA&lt;/strong&gt; que permite aos usu&amp;aacute;rios explorar mais de 5.000 exoplanetas confirmados orbitando estrelas distantes. Atrav&amp;eacute;s de um ambiente 3D cientificamente preciso, os usu&amp;aacute;rios podem visualizar planetas gasosos gigantes, planetas do tamanho da Terra e &amp;quot;super-Terras&amp;quot; &amp;ndash; planetas rochosos maiores que o nosso. A ferramenta oferece a possibilidade de comparar o tamanho dos exoplanetas com o da Terra ou J&amp;uacute;piter e determinar o tempo que levaria para viajar at&amp;eacute; um determinado planeta de carro, jato ou nave estelar &amp;agrave; velocidade da luz. Al&amp;eacute;m disso, &amp;eacute; poss&amp;iacute;vel interagir com modelos virtuais de telesc&amp;oacute;pios espaciais da NASA, como Hubble, Spitzer, Kepler e o rec&amp;eacute;m-lan&amp;ccedil;ado Sat&amp;eacute;lite de Pesquisa de Exoplanetas em Tr&amp;acirc;nsito (TESS)&lt;/p&gt;\\r\\n\\r\\n&lt;p&gt;\\\\\\\\r\\\\\\\\n&lt;/p&gt;', '94032_imagem_2025-03-18_150539823.jpg', 'server_url', 'https://eyes.nasa.gov/apps/exo/#/', 0, '0', 8, 1),
(13, '2', 4, 0, 'Olhos no sistema solar', '&lt;p&gt;O &lt;strong&gt;Olhos no sistema solar&lt;/strong&gt; &amp;eacute; uma ferramenta interativa desenvolvida pela &lt;strong&gt;NASA&lt;/strong&gt; que permite aos usu&amp;aacute;rios explorar o sistema solar em 3D. Atrav&amp;eacute;s dessa plataforma, &amp;eacute; poss&amp;iacute;vel visualizar planetas, luas, asteroides, cometas e as trajet&amp;oacute;rias de diversas miss&amp;otilde;es espaciais em tempo real. A ferramenta oferece uma experi&amp;ecirc;ncia imersiva, permitindo que os usu&amp;aacute;rios naveguem pelo espa&amp;ccedil;o, acompanhem miss&amp;otilde;es passadas, presentes e futuras, e aprendam sobre os corpos celestes e as espa&amp;ccedil;onaves que os exploram. Al&amp;eacute;m disso, &amp;eacute; poss&amp;iacute;vel avan&amp;ccedil;ar ou retroceder no tempo para observar eventos espec&amp;iacute;ficos ou planejar futuras explora&amp;ccedil;&amp;otilde;es.&lt;/p&gt;\\\\r\\\\n', '79085_imagem_2025-03-18_152039213.jpg', 'server_url', 'https://eyes.nasa.gov/apps/solar-system/#/home', 0, '0', 7, 1),
(14, '2', 4, 0, 'Os olhos da NASA no sistema solar', '&lt;p&gt;O &lt;strong&gt;Os olhos da NASA no sistema solar&lt;/strong&gt; &amp;eacute; uma ferramenta interativa desenvolvida pela &lt;strong&gt;NASA&lt;/strong&gt; que permite aos usu&amp;aacute;rios explorar o sistema solar em tempo real, visualizando planetas, luas, asteroides, cometas e as trajet&amp;oacute;rias de diversas miss&amp;otilde;es espaciais. A plataforma oferece uma experi&amp;ecirc;ncia imersiva, permitindo que os usu&amp;aacute;rios naveguem pelo espa&amp;ccedil;o, acompanhem miss&amp;otilde;es passadas, presentes e futuras e aprendam sobre os corpos celestes e as espa&amp;ccedil;onaves que os exploram. Al&amp;eacute;m disso, &amp;eacute; poss&amp;iacute;vel avan&amp;ccedil;ar ou retroceder no tempo para observar eventos espec&amp;iacute;ficos ou planejar futuras explora&amp;ccedil;&amp;otilde;es.&lt;/p&gt;\\\\r\\\\n', '22387_imagem_2025-03-18_153001734.jpg', 'server_url', 'https://eyes.nasa.gov/apps/orrery/#/home', 0, '0', 11, 1),
(17, '2', 10, 0, 'Sky Map Online​', '&lt;p&gt;O &lt;strong&gt;Sky Map Online&lt;/strong&gt; &amp;eacute; uma aplica&amp;ccedil;&amp;atilde;o web interativa que permite aos usu&amp;aacute;rios visualizar o c&amp;eacute;u noturno de qualquer localiza&amp;ccedil;&amp;atilde;o, em qualquer data e hora. Atrav&amp;eacute;s desta ferramenta, &amp;eacute; poss&amp;iacute;vel identificar estrelas, planetas e objetos do espa&amp;ccedil;o profundo (DSO) at&amp;eacute; a magnitude 12. O site oferece funcionalidades como zoom, pan, busca e a capacidade de salvar ou compartilhar mapas estelares personalizados. Al&amp;eacute;m disso, disponibiliza instru&amp;ccedil;&amp;otilde;es detalhadas e tutoriais de astronomia para auxiliar tanto iniciantes quanto entusiastas experientes na explora&amp;ccedil;&amp;atilde;o do cosmos.&lt;/p&gt;\\r\\n\\r\\n&lt;p&gt;\\\\r\\\\n\\\\r\\\\n&lt;/p&gt;\\r\\n\\r\\n&lt;p&gt;\\\\\\\\\\\\\\\\r\\\\\\\\\\\\\\\\n&lt;/p&gt;', '83467_imagem_2025-03-18_160206789.jpg', 'server_url', 'https://www.skymaponline.net/', 0, '0', 3, 1),
(18, '2', 11, 0, 'Stellarium', '&lt;p&gt;Stellarium &amp;eacute; um software de planet&amp;aacute;rio de c&amp;oacute;digo aberto que permite aos usu&amp;aacute;rios explorar o c&amp;eacute;u noturno em tempo real, exibindo um c&amp;eacute;u realista em 3D, semelhante ao que se v&amp;ecirc; a olho nu, com bin&amp;oacute;culos ou telesc&amp;oacute;pio.&lt;/p&gt;\\r\\n\\r\\n&lt;p&gt;\\\\\\\\r\\\\\\\\n&lt;/p&gt;', '48364_imagem_2025-03-18_161343630.jpg', 'server_url', 'https://stellarium-web.org/', 0, '0', 24, 1),
(19, '6', 12, 0, 'Atlas Hist&oacute;rico do Brasil', '<p>​O <strong>Atlas Hist&oacute;rico do Brasil</strong> &eacute; uma plataforma digital desenvolvida pela <strong>Funda&ccedil;&atilde;o Getulio Vargas (FGV)</strong> que oferece uma vis&atilde;o abrangente da hist&oacute;ria do Brasil por meio de mapas, gravuras e documentos hist&oacute;ricos. A plataforma abrange per&iacute;odos desde antes de 1500 at&eacute; 2009, organizados em cap&iacute;tulos que detalham eventos significativos e transforma&ccedil;&otilde;es ocorridas no pa&iacute;s ao longo dos s&eacute;culos.</p>\\r\\n\\r\\n<p>\\\\r\\\\n\\\\r\\\\n</p>\\r\\n\\r\\n<p>\\\\\\\\\\\\\\\\r\\\\\\\\\\\\\\\\n</p>', '9749_imagem_2025-03-19_105711299.jpg', 'server_url', 'https://atlas.fgv.br/', 0, '0', 3, 1),
(20, '6', 13, 0, 'Atlas Português de 1519', '&lt;p&gt;O &lt;strong&gt;Atlas Miller&lt;/strong&gt;, tamb&amp;eacute;m conhecido como &lt;strong&gt;Atlas Lopo Homem-Reineis&lt;/strong&gt;, &amp;eacute; um atlas portugu&amp;ecirc;s datado de 1519, ricamente ilustrado e composto por cerca de uma dezena de cartas n&amp;aacute;uticas. Este trabalho foi uma colabora&amp;ccedil;&amp;atilde;o entre os cart&amp;oacute;grafos Lopo Homem, Pedro Reinel e Jorge Reinel, com ilustra&amp;ccedil;&amp;otilde;es do miniaturista Ant&amp;oacute;nio de Holanda.&lt;/p&gt;\\\\r\\\\n', '82334_imagem_2025-03-19_110530008.jpg', 'server_url', 'http://www.mapas-historicos.com/atlas-miller.htm', 0, '0', 1, 1),
(21, '6', 14, 0, 'Biblioteca Digital de Cartografia Hist&oacute;rica da USP', '<p>A Biblioteca Digital de Cartografia Hist&oacute;rica da USP oferece um acervo de mapas hist&oacute;ricos digitalizados em alta resolu&ccedil;&atilde;o. A plataforma permite a explora&ccedil;&atilde;o detalhada de cole&ccedil;&otilde;es cartogr&aacute;ficas, trazendo informa&ccedil;&otilde;es t&eacute;cnicas, editoriais e contextuais sobre a produ&ccedil;&atilde;o e circula&ccedil;&atilde;o desses mapas ao longo do tempo.</p>\\r\\n\\r\\n<p>\\\\r\\\\n\\\\r\\\\n</p>\\r\\n\\r\\n<p>\\\\\\\\r\\\\\\\\n\\\\\\\\r\\\\\\\\n</p>\\r\\n\\r\\n<p>\\\\r\\\\n\\\\r\\\\n</p>\\r\\n\\r\\n<p>\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\r\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\n</p>', '44183_imagem_2025-03-19_112110416.jpg', 'server_url', 'https://cartografiahistorica.usp.br', 0, '0', 14, 1),
(22, '6', 13, 0, 'Mapas Hist&oacute;ricos do Brasil', '<p>O site &quot;Mapas Hist&oacute;ricos do Brasil&quot; oferece uma cole&ccedil;&atilde;o de mapas que ilustram a evolu&ccedil;&atilde;o territorial do Brasil desde o s&eacute;culo XVI. Os mapas dispon&iacute;veis incluem representa&ccedil;&otilde;es desde o per&iacute;odo colonial at&eacute; o s&eacute;culo XX, permitindo uma compreens&atilde;o visual das mudan&ccedil;as geogr&aacute;ficas e pol&iacute;ticas ao longo da hist&oacute;ria brasileira</p>\\r\\n\\r\\n<p>\\\\r\\\\n\\\\r\\\\n</p>\\r\\n\\r\\n<p>\\\\\\\\\\\\\\\\r\\\\\\\\\\\\\\\\n</p>', '27111_imagem_2025-03-19_112453086.jpg', 'server_url', 'https://www.historia-brasil.com/mapas/mapas-historicos.htm', 0, '0', 3, 1),
(24, '6', 15, 0, 'Panmythica', '<p>O site \"Mapas Históricos do Brasil\" oferece uma coleção de mapas que ilustram a evolução territorial do Brasil desde o século XVI. Os mapas disponíveis incluem representações desde o período colonial até o século XX, permitindo uma compreensão visual das mudanças geográficas e políticas ao longo da história brasileira.</p>', '38530_imagem_2025-03-19_145023709.jpg', 'server_url', 'https://www.panmythica.com/2008/04/mapas-histricos-do-brasil.html', 0, '0', 0, 1),
(25, '7', 4, 0, 'Simulação de Ajuste Isostático Glacial​', '<p>Este site da NASA apresenta uma simulação interativa do Ajuste Isostático Glacial (GIA), que é a resposta da Terra sólida ao acúmulo e derretimento das grandes camadas de gelo durante o último ciclo glacial, aproximadamente 120.000 anos atrás até o presente. A ferramenta permite visualizar mudanças no nível do mar e na elevação do solo ao longo do tempo, oferecendo uma compreensão aprofundada dos processos geofísicos que moldaram a superfície terrestre.</p>', '13788_imagem_2025-03-19_150324273.jpg', 'server_url', 'https://sealevel.nasa.gov/vesl/web/solid-earth/gia/', 0, '0', 0, 1),
(26, '7', 16, 0, 'Banco de Dados Global de Tsunamis Históricos da NOAA', '<p>O Banco de Dados Global de Tsunamis Históricos da NOAA oferece uma ferramenta de busca abrangente para eventos de tsunamis registrados desde 2100 a.C. até o presente. Os usuários podem pesquisar informações detalhadas sobre a origem dos tsunamis, incluindo data, hora, localização, magnitude, altura máxima das ondas e dados socioeconômicos, como número total de fatalidades e estimativas de danos financeiros.</p>', '81900_imagem_2025-03-19_150652203.jpg', 'server_url', 'https://www.ngdc.noaa.gov/hazel/view/hazards/tsunami/event-search', 0, '0', 0, 1),
(27, '7', 17, 0, 'Atlas dos Objetivos de Desenvolvimento Sustentável 2023', '<p>O \"Atlas dos Objetivos de Desenvolvimento Sustentável 2023\" é uma publicação interativa do Banco Mundial que apresenta visualizações de dados e análises sobre os 17 Objetivos de Desenvolvimento Sustentável (ODS). O site reúne estatísticas globais sobre desafios como erradicação da pobreza, mudanças climáticas e desigualdade social, utilizando gráficos e mapas para ilustrar o progresso em cada objetivo.</p>', '2521_imagem_2025-03-19_151344653.jpg', 'server_url', 'https://datatopics.worldbank.org/sdgatlas/?lang=en', 0, '0', 0, 1),
(28, '7', 15, 0, 'OpenSeaMap – O Mapa Náutico Livre​', '<p>O OpenSeaMap é um projeto colaborativo que visa criar e distribuir cartas náuticas gratuitas e de código aberto. A plataforma oferece mapas detalhados com informações sobre balizas, portos, condições meteorológicas, profundidades marítimas e outros dados relevantes para navegantes. Além disso, permite o download de cartas para uso offline em diversos dispositivos e aplicativos, facilitando a navegação segura e informada. ​<a href=\"https://www.openseamap.org/?L=1\" rel=\"nofollow noreferrer noopener\" target=\"_blank\">openseamap.org+2openseamap.org+2map.openseamap.org+2</a></p>\n\n<p><strong>Autor:</strong> O OpenSeaMap é mantido por uma comunidade global de voluntários, composta por navegantes, programadores e entusiastas da cartografia. Este projeto é uma extensão do OpenStreetMap, que busca mapear o mundo de forma aberta e colaborativa. A comunidade do OpenSeaMap dedica-se a coletar e atualizar dados náuticos, garantindo que as informações sejam precisas e acessíveis a todos. ​</p>', '4120_imagem_2025-03-19_151636832.jpg', 'server_url', 'https://map.openseamap.org/index.php?lang=en', 0, '0', 15, 1),
(29, '7', 18, 0, 'Mindat.org – Banco de Dados Mineralógico', '<p>Mindat.org é o maior banco de dados aberto do mundo sobre minerais, rochas, meteoritos e suas localidades de origem. O site oferece informações detalhadas sobre espécies minerais, incluindo propriedades físicas e químicas, dados cristalográficos e locais de ocorrência, além de uma vasta coleção de fotografias e artigos especializados.​</p>', '8074_imagem_2025-03-19_152419738.jpg', 'server_url', 'https://www.mindat.org', 0, '0', 0, 1),
(30, '7', 19, 0, 'Divisão de Satélites e Sensores Ambientais (DISSM) do CPTEC/INPE​', '<p>A Divisão de Satélites e Sensores Ambientais (DISSM) do Centro de Previsão de Tempo e Estudos Climáticos (CPTEC) do Instituto Nacional de Pesquisas Espaciais (INPE) oferece produtos e serviços relacionados ao monitoramento ambiental via satélite. O site disponibiliza imagens de satélite em tempo real, classificação de nuvens, monitoramento de eletricidade atmosférica, índices de radiação ultravioleta, detecção de nevoeiros, oceanografia por satélite, precipitação por radar e satélite, radiação solar, monitoramento de áreas queimadas e ventos derivados de nuvens. Essas informações são essenciais para a previsão do tempo, estudos climáticos e monitoramento ambiental no Brasil e no mundo.​</p>', '81488_imagem_2025-03-19_153643615.jpg', 'server_url', 'https://satelite.cptec.inpe.br/home/index.jsp', 0, '0', 4, 1),
(31, '7', 4, 0, 'Simulação de Fricção Basal da Groenlândia – VESL da NASA', '<p>A Simulação de Fricção Basal da Groenlândia, parte do Laboratório Virtual do Sistema Terrestre (VESL) da NASA, oferece uma ferramenta interativa para explorar como alterações na fricção basal afetam a dinâmica da camada de gelo da Groenlândia. Os usuários podem ajustar parâmetros que influenciam a lubrificação na interface gelo/leito, simulando eventos como aumento de precipitação ou escoamento, e observar as mudanças resultantes na velocidade do gelo. Essa simulação ajuda a compreender melhor os fatores que contribuem para a perda de massa de gelo e a elevação do nível do mar.</p>', '32571_imagem_2025-03-19_153835618.jpg', 'server_url', 'https://sealevel.nasa.gov/vesl/web/ice-sheets/giscui/', 0, '0', 8, 1),
(32, '7', 4, 0, 'Simulação de Redução da Perda de Massa na Antártica devido a Feedbacks da Terra Sólida e do Nível do', '<p>Este site da NASA apresenta uma simulação interativa que demonstra como os feedbacks da Terra sólida e do nível do mar podem desacelerar a perda de massa na Antártica. A ferramenta permite aos usuários explorar como a resposta elástica do leito rochoso e as mudanças no nível do mar influenciam a taxa de derretimento das geleiras antárticas, oferecendo uma compreensão mais profunda dos processos que afetam a estabilidade das camadas de gelo e sua contribuição para a elevação do nível do mar.</p>', '9560_imagem_2025-03-19_154033414.jpg', 'server_url', 'https://sealevel.nasa.gov/vesl/web/sea-level/slr-uplift/', 0, '0', 2, 1),
(33, '7', 20, 0, 'Germanium - Elemento Químico', '<p>A página fornece informações detalhadas sobre o germânio, incluindo suas propriedades físicas e químicas, aplicações e história. O germânio é um metalóide cinza-prateado, utilizado principalmente na fabricação de semicondutores e fibras ópticas. Descoberto em 1886 por Clemens Winkler, sua existência já havia sido prevista por Dmitri Mendeleev com base na tabela</p>', '7713_imagem_2025-03-19_161951450.jpg', 'server_url', 'https://periodic-table.rsc.org/element/32/germanium', 0, '0', 0, 1),
(34, '7', 24, 0, 'USGS mineral recursos On-Line Spatial dados', '<p>mineral recursos informação, junto com the geológico, geoquímico, and geofísico informação needed para entender e avaliar mineral recurso potencial.</p>', '89522_imagem_2025-03-19_172322648.jpg', 'server_url', 'https://mrdata.usgs.gov/', 0, '0', 0, 1),
(35, '7', 4, 0, 'Fenômenos Naturais', '<p>O site sealevel.nasa.gov foi desenvolvido para fornecer aos usuários conteúdo relevante e atualizado. A plataforma apresenta uma interface intuitiva para facilitar a navegação e encontrar as informações desejadas. O site disponibiliza diversos recursos e conteúdos dentro de sua área de atuação, permitindo que os visitantes explorem diferentes seções e funcionalidades. Com design moderno e responsivo, a experiência de navegação é otimizada para diferentes dispositivos, desde desktops até smartphones. Para conhecer todos os recursos oferecidos, recomenda-se visitar o endereço original e explorar o site completamente.</p>', '21146_imagem_2025-03-19_174234372.jpg', 'server_url', 'https://sealevel.nasa.gov/vesl/web/sea-level/slr-antarctica/', 0, '0', 11, 1),
(37, '7', 4, 0, 'Ferramenta de Análise de Dados sobre Mudança do Nível do Mar', '<p>A <strong>Ferramenta de Análise de Dados sobre Mudança do Nível do Mar da NASA (DAT)</strong> é uma plataforma interativa desenvolvida pelo <strong>Jet Propulsion Laboratory (JPL) da NASA</strong>. Ela permite visualizar e analisar dados relacionados ao aumento do nível do mar, fornecendo informações essenciais sobre as mudanças climáticas globais.</p>\n\n<p>O site combina dados de <strong>observações por satélite</strong>, medições em tempo real e modelos climáticos para apresentar uma visão detalhada das variações do nível do mar e seus impactos.</p>', '5794_imagem_2025-03-20_151221651.jpg', 'server_url', 'https://sealevel.nasa.gov/data-analysis-tool/#b=ESRI_World_Imagery&amp;l=OSMCoastlines(1)&amp;vm=2D&amp;ve=-90,-45.91054313099041,90,45.91054313099041&amp;pl=false&amp;pb=false&amp;tr=false&amp;d=2025-03-17&amp;tlr=months&amp;analysis_state=W10=', 0, '0', 0, 1),
(38, '7', 4, 0, 'Ferramenta de Avaliação e Análise do Nível do Mar ', '<p>A <strong>Ferramenta de Avaliação e Análise do Nível do Mar (SEA)</strong> da NASA é uma plataforma online que permite aos usuários visualizar e analisar as mudanças no nível do mar em diferentes regiões globais. Ela combina dados de satélites, marégrafos e outras observações para fornecer uma visão detalhada das variações do nível do mar entre 1993 e 2019. ​</p>', '41023_imagem_2025-03-20_151450806.jpg', 'server_url', 'https://sealevel.nasa.gov/sea-level-evaluation-tool', 0, '0', 0, 1),
(39, '7', 4, 0, 'Ferramenta de Simulação do Glaciar Columbia', '<p>A <strong>Ferramenta de Simulação do Glaciar Columbia</strong> é uma plataforma interativa desenvolvida pela <strong>NASA</strong> para permitir que os usuários explorem e compreendam a dinâmica do <strong>Glaciar Columbia</strong>, localizado no Alasca.</p>\n\n<p>Essa ferramenta possibilita a análise de mudanças no glaciar ao longo do tempo, permitindo ajustar variáveis climáticas para observar como ele responde a diferentes condições ambientais.</p>', '80361_imagem_2025-03-20_151948990.jpg', 'server_url', 'https://sealevel.nasa.gov/vesl/web/glaciers/columbia/', 0, '0', 7, 1),
(40, '7', 16, 0, 'NOAA Bathymetric Data Viewer', '<p>O <strong>NOAA Bathymetric Data Viewer</strong> é uma ferramenta interativa desenvolvida pela <strong>Administração Nacional Oceânica e Atmosférica (NOAA)</strong> dos Estados Unidos, através dos <strong>Centros Nacionais de Informação Ambiental (NCEI)</strong>. Este visualizador permite aos usuários explorar, identificar e baixar dados batimétricos, que representam a topografia subaquática de oceanos, mares e outros corpos d\'água.</p>', '41480_imagem_2025-03-20_152438998.jpg', 'server_url', 'https://www.ncei.noaa.gov/maps/bathymetry/', 0, '0', 3, 1),
(41, '7', 26, 0, ' Visualização Global de Condições Climáticas em Tempo Real', '<p>O <strong>earth.nullschool.net</strong> é uma plataforma interativa que exibe visualizações animadas das condições climáticas globais <strong>em tempo real</strong>. Ele utiliza dados meteorológicos de supercomputadores para representar ventos, temperaturas, correntes oceânicas, poluição atmosférica e outras variáveis ambientais em um <strong>mapa esférico e dinâmico</strong>.</p>\n\n<p>O site é amplamente utilizado por <strong>meteorologistas, cientistas, entusiastas do clima e educadores</strong>, fornecendo uma maneira intuitiva e visualmente impressionante de entender os padrões atmosféricos e oceânicos do planeta.</p>', '72795_imagem_2025-03-20_154107882.jpg', 'server_url', 'earth.nullschool.net', 0, '0', 1, 1),
(42, '7', 4, 0, 'Mapeamento de Impressões Digitais de Gradiente', '<p>A <strong>Ferramenta de Mapeamento de Impressões Digitais de Gradiente</strong> é uma plataforma interativa desenvolvida pela <strong>NASA</strong> que permite aos usuários explorar como as mudanças na espessura do gelo em diferentes regiões glaciares afetam o nível do mar em localidades específicas ao redor do mundo. Esta ferramenta ajuda a compreender a relação entre o derretimento de gelo em áreas específicas e o aumento do nível do mar em cidades costeiras. ​</p>', '2458_imagem_2025-03-20_154346330.jpg', 'server_url', 'https://sealevel.nasa.gov/vesl/web/sea-level/slr-gfm/', 0, '0', 0, 1),
(43, '7', 4, 0, 'Simulação de Movimento Polar', '<p>A <strong>Simulação de Movimento Polar</strong> é uma ferramenta interativa desenvolvida pela NASA no âmbito do <strong>Laboratório Virtual do Sistema Terrestre (VESL)</strong>. Esta plataforma permite aos usuários explorar como diferentes processos geofísicos influenciam o movimento do eixo de rotação da Terra, conhecido como <strong>movimento polar</strong>, durante períodos específicos.</p>', '84536_imagem_2025-03-20_154547103.jpg', 'server_url', 'https://sealevel.nasa.gov/vesl/web/sea-level/polar-motion/', 0, '0', 0, 1),
(44, '7', 27, 0, 'INMET', '<p>O site oficial do INMET oferece uma ampla gama de serviços e informações meteorológicas, incluindo previsões de tempo, monitoramento climático, dados meteorológicos históricos e atuais, além de publicações e boletins técnicos.</p>', '31858_imagem_2025-03-20_154927515.jpg', 'server_url', 'https://portal.inmet.gov.br', 0, '0', 0, 1),
(45, '7', 16, 0, 'nowCOAST™: Portal Interativo da NOAA para Monitoramento Costeiro em Tempo Real', '<p>O <strong>nowCOAST™</strong> é um portal interativo desenvolvido pela <strong>Administração Nacional Oceânica e Atmosférica (NOAA)</strong> dos Estados Unidos. Este serviço de mapeamento geoespacial fornece acesso em tempo real a observações costeiras, previsões meteorológicas e oceanográficas, além de alertas de condições ambientais adversas. O nowCOAST™ integra dados de diversas fontes da NOAA e de outros sistemas regionais de observação oceânica e meteorológica, oferecendo uma visão abrangente das condições ambientais atuais e futuras para usuários costeiros e marítimos. ​</p>', '75708_imagem_2025-03-20_155119098.jpg', 'server_url', 'https://nowcoast.noaa.gov/', 0, '0', 6, 1),
(46, '7', 4, 0, 'Simulação do Recuo do Gelo no Sudoeste da Groenlândia nos Últimos 12.000 Anos', '<p>A <strong>Simulação do Recuo do Gelo no Sudoeste da Groenlândia nos Últimos 12.000 Anos</strong> é uma ferramenta interativa desenvolvida pela NASA, disponível no <strong>Laboratório Virtual do Sistema Terrestre (VESL)</strong>. Esta simulação ilustra o recuo da camada de gelo no sudoeste da Groenlândia durante o Holoceno, aproximadamente os últimos 12.000 anos.</p>', '11208_imagem_2025-03-20_160315216.jpg', 'server_url', 'https://sealevel.nasa.gov/vesl/web/ice-sheets/greenland-ice-retreat/', 0, '0', 26, 1),
(47, '7', 28, 0, 'SatFlare ', '<p>O SatFlare é uma ferramenta valiosa para entusiastas da astronomia, educadores e qualquer pessoa interessada em observar satélites e fenômenos relacionados. Ele fornece informações precisas e atualizadas que permitem aos usuários planejar observações e entender melhor o movimento dos satélites ao redor da Terra. Além disso, a capacidade de assistir a transmissões ao vivo da ISS oferece uma perspectiva única de nosso planeta.</p>', '79034_imagem_2025-03-20_160812575.jpg', 'server_url', 'https://www.satflare.com/home.asp', 0, '0', 0, 1),
(48, '7', 4, 0, 'Simulação de Sensibilidade da Camada de Gelo da Antártida – Laboratório Virtual do Sistema Terrestre', '<p>A <strong>Simulação de Sensibilidade da Camada de Gelo da Antártida</strong> é uma ferramenta interativa desenvolvida pela NASA, disponível no <strong>Laboratório Virtual do Sistema Terrestre (VESL)</strong>. Esta simulação utiliza supercomputadores da NASA e o framework <strong>Ice Sheet System Model (ISSM)</strong> para explorar como a camada de gelo da Antártida poderia mudar em volume de gelo acima da flutuação em resposta a diferentes forçantes climáticas ao longo de um período de 100 anos.</p>', '92970_imagem_2025-03-20_160943210.jpg', 'server_url', 'https://sealevel.nasa.gov/vesl/web/sea-level/slr-antarctica/', 0, '0', 0, 1),
(49, '7', 29, 0, 'Mapas Meteorológicos Interativos', '<p>A <strong>meteoblue</strong> oferece mapas meteorológicos interativos que permitem aos usuários visualizar condições climáticas em tempo real e previsões detalhadas para qualquer localidade no mundo. A plataforma disponibiliza uma ampla gama de variáveis meteorológicas, como temperatura, precipitação, vento e cobertura de nuvens, apresentadas de forma intuitiva e personalizável</p>', '47126_imagem_2025-03-20_163612993.jpg', 'server_url', 'https://www.meteoblue.com/pt/tempo/mapas/index#coords=2.82/-0.86/107.69&amp;map=windAnimation~rainbow~auto~10%20m%20above%20gnd~none', 0, '0', 0, 1),
(50, '14', 30, 0, ' Atlas do Microbioma Humano', '<p>O <strong>Atlas do Microbioma Humano</strong> é um recurso online dedicado à análise de dados do microbioma humano, focando em amostras orais e intestinais provenientes de diversas coortes de indivíduos saudáveis e pacientes com diferentes doenças. O objetivo principal é integrar dados de metagenômica e outras abordagens ômicas utilizando a biologia de sistemas para compreender melhor as interações entre microrganismos e sua influência na saúde humana</p>', '17155_imagem_2025-03-20_171749226.jpg', 'server_url', 'https://www.microbiomeatlas.org/', 0, '0', 25, 1),
(51, '14', 31, 0, 'GBIF ', '<p>Oferece um portal de busca de ocorrências de espécies, permitindo aos usuários acessar registros de presença de diversas espécies ao redor do mundo. Este recurso é essencial para pesquisadores, conservacionistas e entusiastas da biodiversidade que buscam informações detalhadas sobre a distribuição de espécies.</p>', '52151_imagem_2025-03-20_173530400.jpg', 'server_url', 'https://www.gbif.org/pt/occurrence/search?occurrence_status=present', 0, '0', 2, 1),
(52, '14', 32, 0, 'iNaturalist', '<p>O <strong>iNaturalist</strong> é uma rede social de naturalistas, biólogos e cidadãos interessados em registrar e compartilhar observações da biodiversidade ao redor do mundo. A plataforma permite que os usuários documentem plantas, animais e outros organismos, contribuindo para uma base de dados global sobre a vida selvagem. As observações podem ser registradas através do site ou de aplicativos móveis, facilitando o compartilhamento e a identificação colaborativa das espécies observadas.</p>', '63407_imagem_2025-03-20_173737315.jpg', 'server_url', 'https://www.inaturalist.org/observations', 0, '0', 0, 1),
(53, '14', 15, 0, 'MyCoPortal', '<p>O <strong>MyCoPortal</strong> é uma plataforma online que oferece acesso a uma vasta gama de dados sobre fungos, provenientes de diversas coleções e instituições ao redor do mundo. Destina-se a taxonomistas, biólogos de campo, ecologistas, educadores e cientistas cidadãos interessados no estudo da diversidade fúngica. Utilizando o sistema <strong>Symbiota</strong>, o portal permite a geração dinâmica de listas de espécies georreferenciadas, mapas de distribuição e chaves de identificação interativas, todas vinculadas a uma rica coleção de imagens digitais que documentam a diversidade fúngica.</p>\n\n<p><strong>Desenvolvedor:</strong></p>\n\n<p>O portal é mantido por uma rede de universidades, jardins botânicos, museus e agências que fornecem informações taxonômicas, ambientais e baseadas em espécimes. Utiliza o sistema <strong>Symbiota</strong> para integrar e apresentar os dados de forma acessível e interativa.</p>', '53747_imagem_2025-03-20_184305401.jpg', 'server_url', 'https://www.mycoportal.org/portal/', 0, '0', 7, 1),
(54, '14', 33, 0, 'Movebank', '<p>O <strong>Movebank</strong> é uma plataforma online gratuita dedicada ao gerenciamento, compartilhamento, análise e arquivamento de dados de rastreamento animal. Hospedada pelo <strong>Instituto Max Planck de Comportamento Animal</strong>, a plataforma auxilia pesquisadores e gestores de vida selvagem globalmente, fornecendo ferramentas para lidar com dados coletados por sensores anexados a animais.</p>', '89776_imagem_2025-03-20_185002150.jpg', 'server_url', 'https://www.movebank.org/cms/movebank-content/about-movebank', 0, '0', 2, 1),
(55, '14', 31, 0, 'GBIF: Plataforma de Busca de Espécies', '<p>O <strong>Global Biodiversity Information Facility (GBIF)</strong> é uma rede internacional que oferece acesso gratuito e aberto a dados sobre a biodiversidade mundial. Através do portal de busca de espécies, os usuários podem pesquisar informações detalhadas sobre uma vasta gama de organismos, desde plantas e animais até fungos e microrganismos.</p>', '45071_imagem_2025-03-20_185130518.jpg', 'server_url', 'https://www.gbif.org/species/search?q=', 0, '0', 4, 1),
(56, '14', 34, 0, 'Trade Map: Estatísticas de Comércio para o Desenvolvimento de Negócios Internacionais', '<p>O <strong>Trade Map</strong> é uma ferramenta online desenvolvida pelo <strong>Centro de Comércio Internacional (ITC)</strong> que fornece, em forma de tabelas, gráficos e mapas, indicadores sobre o desempenho das exportações, demanda internacional, mercados alternativos e mercados competitivos. Além disso, oferece um diretório de empresas importadoras e exportadoras. A plataforma abrange 220 países e territórios e 5.300 produtos classificados pelo Sistema Harmonizado (SH). Os fluxos comerciais mensais, trimestrais e anuais estão disponíveis desde o nível mais agregado até o nível de posição pautal.</p>', '37989_imagem_2025-03-21_093433151.jpg', 'server_url', 'https://www.trademap.org/Index.aspx', 0, '0', 7, 1),
(57, '14', 35, 0, 'HungerMap LIVE: Monitoramento em Tempo Real da Segurança Alimentar Global', '<p>O <strong>HungerMap LIVE</strong> é uma plataforma interativa desenvolvida pelo <strong>Programa Mundial de Alimentos (PMA)</strong> que utiliza inteligência artificial, aprendizado de máquina e análise de dados para monitorar e prever a magnitude e a gravidade da fome em mais de 90 países em tempo quase real. A plataforma integra dados públicos sobre segurança alimentar, nutrição, conflitos, clima e diversos indicadores macroeconômicos, oferecendo uma visão holística da situação alimentar global.</p>', '73516_imagem_2025-03-21_094943354.jpg', 'server_url', 'https://hungermap.wfp.org/', 0, '0', 5, 1),
(58, '14', 36, 0, 'Galeria de Mapas da OMS: Visualizando Dados Globais de Saúde', '<p>A <strong>Galeria de Mapas</strong> da Organização Mundial da Saúde (OMS) é uma coleção abrangente de mapas que ilustram dados sobre diversos tópicos de saúde ao redor do mundo. Esses mapas oferecem representações visuais de informações críticas, facilitando a compreensão de padrões, tendências e distribuições geográficas de questões de saúde pública.</p>', '81891_imagem_2025-03-21_102120160.jpg', 'server_url', 'https://www.who.int', 0, '0', 114, 1),
(59, '14', 37, 0, 'Human Climate Horizons', '<p>O <strong>Human Climate Horizons (HCH)</strong> é uma plataforma de dados e insights que fornece informações localizadas sobre os impactos futuros das mudanças climáticas em diversas dimensões do desenvolvimento humano e da segurança. Desenvolvida em colaboração entre o <strong>Programa das Nações Unidas para o Desenvolvimento (PNUD)</strong> e o <strong>Climate Impact Lab</strong>, a plataforma oferece acesso aberto e escalável a dados que permitem explorar possíveis cenários futuros alimentados por pesquisas multidisciplinares de ponta.</p>', '61635_imagem_2025-03-21_111213926.jpg', 'server_url', 'https://horizons.hdr.undp.org', 0, '0', 30, 1),
(60, '14', 38, 0, 'Mapa Mundial da Água', '<p>O <strong>World Water Map</strong> é uma plataforma interativa criada pela <strong>National Geographic Society</strong>, em parceria com a <strong>Universidade de Utrecht</strong> e a empresa de geotecnologia <strong>Esri</strong>, com o objetivo de mostrar a situação global da água doce no planeta.</p>\n\n<p>Ela permite visualizar, em detalhes, <strong>onde a demanda por água excede sua disponibilidade natural renovável</strong> — um fenômeno conhecido como <strong>déficit hídrico</strong>. A ferramenta destaca os principais desafios relacionados à escassez de água e visa informar políticas públicas, educação e ações individuais voltadas à conservação e gestão hídrica sustentável.</p>', '37950_imagem_2025-03-21_150137582.jpg', 'server_url', 'https://worldwatermap.nationalgeographic.org', 0, '0', 0, 1),
(62, '14', 39, 0, 'Earth Microbiome Project: Mapeando a Diversidade Microbiana Global', '<p>O <strong>Earth Microbiome Project (EMP)</strong> é uma iniciativa colaborativa em larga escala que visa caracterizar a diversidade taxonômica e funcional dos microrganismos em nosso planeta. Utilizando sequenciamento de DNA e espectrometria de massa de amostras coletadas globalmente, o EMP busca compreender padrões na ecologia microbiana através de diversos biomas e habitats.</p>', '23203_imagem_2025-03-21_151022142.jpg', 'server_url', 'https://earthmicrobiome.org/', 0, '0', 4, 1),
(63, '14', 38, 0, 'Migração Animal: Fenômeno Natural e Sua Importância', '<p>O site da National Geographic oferece uma coleção de recursos educativos sobre a migração animal, destacando como diversas espécies se deslocam sazonalmente em busca de alimento, melhores condições ou para reprodução. Esses materiais são voltados para estudantes do ensino fundamental e médio, proporcionando uma compreensão aprofundada desse fenômeno natural.</p>', '15279_imagem_2025-03-21_151245637.jpg', 'server_url', 'https://education.nationalgeographic.org/resource/resource-library-animal-migration/', 0, '0', 4, 1),
(64, '14', 4, 0, 'NASA Earth Observatory ', '<p>O <strong>NASA Earth Observatory</strong> é uma plataforma online criada pela NASA em 1999, dedicada a compartilhar imagens de satélite, histórias e descobertas sobre o meio ambiente, sistemas terrestres e clima. Através de dados de satélite e pesquisas científicas, o site oferece uma visão abrangente das mudanças e fenômenos que ocorrem no nosso planeta. ​</p>', '63440_imagem_2025-03-21_152108869.jpg', 'server_url', 'https://earthobservatory.nasa.gov', 0, '0', 1, 1),
(65, '14', 40, 0, 'CIAAW – Comissão de Abundâncias Isotópicas e Pesos Atômicos', '<p>O site oficial da <strong>CIAAW</strong> (sigla em inglês para <em>Commission on Isotopic Abundances and Atomic Weights</em>) apresenta o trabalho da comissão responsável por definir e revisar periodicamente os <strong>pesos atômicos</strong> e <strong>abundâncias isotópicas</strong> dos elementos químicos com base nas descobertas mais recentes.</p>\n\n<p>Desde sua fundação em <strong>1899</strong>, a CIAAW é referência global em química, sendo responsável por publicar tabelas e dados essenciais para o trabalho de químicos, engenheiros, educadores e cientistas em todo o mundo.</p>', '53168_imagem_2025-03-21_153005660.jpg', 'server_url', 'https://www.ciaaw.org/index.htm', 0, '0', 237, 1),
(66, '15', 8, 0, 'Google Arts & Culture: Explorando o Mundo da Arte e Cultura Global', '<p>O <strong>Google Arts &amp; Culture</strong> é uma plataforma online que permite aos usuários explorar coleções de arte, patrimônio cultural e histórias de mais de 2.000 museus, galerias e instituições culturais de 80 países. Disponível tanto na web quanto como aplicativo móvel, oferece acesso a uma vasta gama de conteúdos culturais e artísticos. ​</p>', '65664_imagem_2025-03-21_153542324.jpg', 'server_url', 'https://artsandculture.google.com/explore', 0, '0', 2, 1),
(67, '15', 41, 0, 'Museu Britânico', '<p>O Museu Britânico, fundado em 1753, é uma das instituições culturais mais importantes do mundo, abrigando uma coleção de mais de 8 milhões de objetos que abrangem dois milhões de anos de história humana. Localizado em Londres, o museu oferece acesso gratuito ao público e agora disponibiliza grande parte de seu acervo online, permitindo que pessoas de todo o mundo explorem suas coleções sem sair de casa.</p>', '83916_imagem_2025-03-21_155409531.jpg', 'server_url', 'https://www.britishmuseum.org/collection/', 0, '0', 0, 1),
(68, '15', 42, 0, ' Museu Nacional de Arte Moderna e Contemporânea da Coreia (MMCA) ', '<p>O <strong>MMCA (National Museum of Modern and Contemporary Art, Korea)</strong> oferece em seu site uma seção dedicada a <strong>filmes digitais e obras em vídeo</strong>, proporcionando acesso gratuito a conteúdos artísticos contemporâneos, performances audiovisuais e projetos experimentais.</p>\n\n<p>Essa galeria digital faz parte do esforço do museu em <strong>democratizar o acesso à arte</strong>, aproximando o público de <strong>criações visuais inovadoras</strong> realizadas por artistas coreanos e internacionais.</p>', '60132_imagem_2025-03-21_160412967.jpg', 'server_url', 'https://www.mmca.go.kr/eng/digitals/digitalMovList.do?srcTpChk=15', 0, '0', 0, 1),
(69, '15', 8, 0, 'Museu da Acrópole: Uma Viagem Virtual pela Antiga Grécia', '<p>O Museu da Acrópole, localizado em Atenas, Grécia, é uma instituição arqueológica dedicada a preservar e exibir artefatos significativos da Acrópole ateniense, o santuário mais importante da cidade antiga. Inaugurado em junho de 2009, o museu abriga mais de 3.000 peças famosas, oferecendo aos visitantes uma visão abrangente da vida na Acrópole desde os tempos pré-históricos até o final da Antiguidade.</p>', '71051_imagem_2025-03-21_160607836.jpg', 'server_url', 'https://artsandculture.google.com/partner/acropolis-museum', 0, '0', 3, 1),
(70, '15', 8, 0, 'Google Arts & Culture Anne Frank', '<p>Uma das milhões de vítimas do Holocausto durante a Segunda Guerra Mundial. Por dois anos, Anne e sua família viveram escondidos no anexo do negócio de seu pai, onde ela escreveu seu famoso diário. Aos 15 anos, Anne morreu em um campo de concentração. ​</p>\n\n<p>O Google Arts &amp; Culture, em parceria com a Casa de Anne Frank, oferece uma visão aprofundada sobre sua vida, diário e legado. A plataforma apresenta imagens, fotografias e informações detalhadas que permitem aos usuários explorar a história de Anne Frank e compreender o impacto duradouro de seu testemunho.</p>', '68973_imagem_2025-03-21_160647613.jpg', 'server_url', 'https://artsandculture.google.com/story/GQUxAm6liAwA8A', 0, '0', 3, 1),
(71, '15', 15, 0, ' Instituto de Arte de Chicago', '<p>O <strong>Instituto de Arte de Chicago</strong> é um dos principais museus de arte dos Estados Unidos, abrigando uma vasta coleção que abrange mais de 5.000 anos de expressão humana de diversas culturas ao redor do mundo.</p>', '79594_imagem_2025-03-21_162124994.jpg', 'server_url', 'https://www.artic.edu', 0, '0', 4, 1),
(72, '15', 43, 0, 'Tour Virtual – Museu Nacional de História Natural do Smithsonian', '<p>O <strong>Museu Nacional de História Natural do Smithsonian</strong>, localizado em Washington, D.C. (EUA), oferece uma <strong>visita virtual interativa e gratuita</strong>, permitindo que qualquer pessoa explore suas <strong>exposições permanentes, temporárias e passadas</strong> no conforto de casa.</p>\n\n<p>O tour é totalmente navegável e apresenta imagens em alta resolução das salas do museu, com recursos que permitem <strong>ampliar objetos, ler painéis explicativos</strong> e se movimentar como se estivesse presencialmente nos corredores do museu.</p>', '31981_imagem_2025-03-21_162536036.jpg', 'server_url', 'https://naturalhistory2.si.edu/vt3/NMNH/', 0, '0', 5, 1),
(73, '15', 44, 0, ' Museu do Louvre Online', '<p>O Louvre é um dos museus mais visitados do mundo, atraindo milhões de visitantes anualmente. Para evitar longas filas e garantir uma experiência mais tranquila, é recomendável adquirir ingressos com antecedência e planejar a visita, focando nas obras de maior interesse, devido à vasta extensão do acervo</p>', '34985_imagem_2025-03-21_162917434.jpg', 'server_url', 'https://www.louvre.fr/en', 0, '0', 17, 1),
(74, '15', 45, 0, 'Museus Vaticanos', '<p>O site oficial dos Museus Vaticanos serve como a principal plataforma de comunicação e informação do complexo museológico do Vaticano. Disponível em vários idiomas, incluindo português, o portal oferece uma visão abrangente das coleções, serviços e atividades dos museus.</p>', '65340_imagem_2025-03-21_163553051.jpg', 'server_url', 'https://www.museivaticani.va/content/museivaticani/en/collezioni/aree-archeologiche0/necropoli-della-via-triumphalis/tour-virtuale.html', 0, '0', 12, 1),
(75, '15', 8, 0, ' Tour Virtual pelo Metropolitan Museum of Art', '<p>O <strong>Metropolitan Museum of Art</strong>, conhecido como <strong>The Met</strong>, é um dos maiores e mais renomados museus de arte do mundo, localizado em Nova York, EUA. Fundado em 1870, abriga uma coleção de mais de <strong>2 milhões de obras</strong> que abrangem 5.000 anos de história, desde a antiguidade clássica até a arte moderna.</p>', '30919_imagem_2025-03-21_163808542.jpg', 'server_url', 'https://artsandculture.google.com/streetview/metropolitan-museum-of-art/KAFHmsOTE-4Xyw?sv_lng=-73.96429083926874&amp;sv_lat=40.77845769108341&amp;sv_h=49.315581064826695&amp;sv_p=-2.3203057268957963&amp;sv_pid=ARaKv8mwitBuaFqgv8NvXw&amp;sv_z=1.99999999999', 0, '0', 18, 1),
(76, '15', 46, 0, 'Pinacoteca de São Paulo', '<p>O site oficial da <strong>Pinacoteca de São Paulo</strong> é a principal plataforma de comunicação e informação deste que é um dos mais importantes museus de arte do Brasil. Fundada em 1905, a Pinacoteca é o museu de arte mais antigo do estado de São Paulo, dedicado principalmente à produção artística brasileira do século XIX até a contemporaneidade.</p>', '17276_imagem_2025-03-21_172322608.jpg', 'server_url', 'https://pinacoteca.org.br/pina/o-museu/institucional/', 0, '0', 114, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tbl_active_log`
--

CREATE TABLE `tbl_active_log` (
  `id` int(10) NOT NULL,
  `user_id` int(10) NOT NULL,
  `date_time` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tbl_active_log`
--

INSERT INTO `tbl_active_log` (`id`, `user_id`, `date_time`) VALUES
(14, 36, '1612763801'),
(15, 37, '1612763879'),
(16, 38, '1612763889'),
(17, 39, '1612763917'),
(18, 40, '1612764092'),
(19, 41, '1612765387'),
(20, 42, '1612765454'),
(21, 43, '1612780799'),
(22, 44, '1612771933'),
(23, 45, '1612772297'),
(24, 46, '1612882869'),
(25, 47, '1620226387'),
(26, 48, '1625313100'),
(27, 49, '1616271986'),
(28, 50, '1616409549'),
(29, 52, '1616545225'),
(30, 53, '1616719998'),
(31, 54, '1622935994'),
(32, 55, '1616862422'),
(33, 56, '1616927332'),
(34, 57, '1617156116'),
(35, 58, '1617241810'),
(36, 60, '1617509388'),
(37, 61, '1617751226'),
(38, 62, '1618661622'),
(39, 63, '1619108822'),
(40, 64, '1619285150'),
(41, 67, '1619645268'),
(42, 68, '1619836024'),
(43, 69, '1620257419'),
(44, 70, '1620538426'),
(45, 72, '1621057858'),
(46, 75, '1621903391'),
(47, 76, '1622203434'),
(48, 77, '1622222084'),
(49, 81, '1624769711'),
(50, 84, '1622710013'),
(51, 85, '1623619213'),
(52, 87, '1622927955'),
(53, 88, '1623013113'),
(54, 90, '1623646266'),
(55, 91, '1623141685'),
(56, 98, '1623146861'),
(57, 99, '1623240019'),
(58, 102, '1623416401'),
(59, 103, '1625205580'),
(60, 105, '1623519460'),
(61, 108, '1624176824'),
(62, 109, '1624192851'),
(63, 110, '1624196193'),
(64, 111, '1624210317'),
(65, 112, '1624305448'),
(66, 113, '1624275965'),
(67, 114, '1624256249'),
(68, 115, '1624337797'),
(69, 117, '1624516467'),
(70, 118, '1624525713'),
(71, 119, '1624603067'),
(72, 120, '1624617500'),
(73, 121, '1624769542'),
(74, 122, '1624770222'),
(75, 123, '1624815466'),
(76, 124, '1624949502'),
(77, 125, '1625056820'),
(78, 126, '1625136567'),
(79, 128, '1625306784'),
(80, 129, '1625307485'),
(81, 130, '1625308126'),
(82, 132, '1625316430'),
(83, 134, '1625397804'),
(84, 135, '1625422240'),
(85, 137, '1625426078'),
(86, 138, '1627756018'),
(87, 139, '1625597583'),
(88, 140, '1712228861'),
(89, 141, '1625461363'),
(90, 145, '1626086685'),
(91, 146, '1625824904'),
(92, 147, '1625854592'),
(93, 149, '1625858048'),
(94, 150, '1675237982'),
(95, 151, '1626070681'),
(96, 153, '1626285056'),
(97, 154, '1626327066'),
(98, 155, '1626448766'),
(99, 156, '1626483015'),
(100, 157, '1626941113'),
(101, 158, '1627148919'),
(102, 159, '1627221914'),
(103, 161, '1627372336'),
(104, 162, '1627415399'),
(105, 166, '1675238048'),
(106, 167, '1627822737'),
(107, 171, '1675070196'),
(108, 174, '1628230107'),
(109, 181, '1628515913'),
(110, 185, '1662726749'),
(111, 187, '1628628957'),
(112, 192, '1628793683'),
(113, 193, '1629264982'),
(114, 196, '1628892761'),
(115, 197, '1629191125'),
(116, 198, '1629019172'),
(117, 199, '1629124700'),
(118, 200, '1629290763'),
(119, 203, '1629355277'),
(120, 204, '1629437468'),
(121, 205, '1629440318'),
(122, 206, '1629456725'),
(123, 210, '1629477908'),
(124, 240, '1629696095'),
(125, 241, '1629799731'),
(126, 242, '1629706315'),
(127, 243, '1629721487'),
(128, 244, '1629727063'),
(129, 245, '1629870619'),
(130, 246, '1633147889'),
(131, 247, '1629837746'),
(132, 248, '1629873693'),
(133, 249, '1629881250'),
(134, 250, '1675238133'),
(135, 251, '1689143005'),
(136, 252, '1629885666'),
(137, 253, '1629893897'),
(138, 254, '1629922845'),
(139, 256, '1630182609'),
(140, 257, '1630229898'),
(141, 258, '1630419483'),
(142, 262, '1630691808'),
(143, 263, '1630892242'),
(144, 264, '1630957203'),
(145, 265, '1630973295'),
(146, 266, '1631047549'),
(147, 268, '1631103963'),
(148, 272, '1631445507'),
(149, 273, '1631452810'),
(150, 276, '1631486765'),
(151, 277, '1632048638'),
(152, 279, '1632048740'),
(153, 280, '1648559641'),
(154, 282, '1632424842'),
(155, 283, '1632495882'),
(156, 284, '1632507000'),
(157, 285, '1632601159'),
(158, 286, '1632639268'),
(159, 287, '1632657403'),
(160, 288, '1632775611'),
(161, 289, '1632809690'),
(162, 290, '1632847063'),
(163, 292, '1636030552'),
(164, 293, '1633087798'),
(165, 294, '1633157855'),
(166, 295, '1633209563'),
(167, 296, '1633372366'),
(168, 297, '1633451057'),
(169, 299, '1633783532'),
(170, 300, '1633979612'),
(171, 298, '1634550483'),
(172, 303, '1634575713'),
(173, 304, '1694686682'),
(174, 305, '1634704325'),
(175, 308, '1634708592'),
(176, 310, '1634711961'),
(177, 312, '1634712860'),
(178, 313, '1634723381'),
(179, 314, '1634802814'),
(180, 317, '1634941061'),
(181, 318, '1634958440'),
(183, 320, '1635091241'),
(184, 321, '1635141768'),
(185, 322, '1635157040'),
(186, 323, '1674116261'),
(187, 327, '1635354265'),
(188, 328, '1635371045'),
(189, 329, '1635404787'),
(190, 331, '1635458887'),
(191, 332, '1635550923'),
(192, 333, '1635762777'),
(193, 334, '1635795606'),
(194, 336, '1635886828'),
(195, 338, '1636049797'),
(196, 340, '1636059784'),
(197, 341, '1636117758'),
(198, 345, '1636692914'),
(199, 346, '1637086343'),
(200, 348, '1637544244'),
(201, 349, '1637610040'),
(202, 350, '1637645949'),
(203, 351, '1637656547'),
(204, 352, '1637732484'),
(205, 353, '1637794141'),
(206, 354, '1695263019'),
(207, 355, '1638106959'),
(208, 356, '1638124657'),
(209, 357, '1638146209'),
(210, 361, '1638594961'),
(211, 362, '1638699301'),
(212, 363, '1639067536'),
(213, 364, '1639299491'),
(214, 365, '1639609609'),
(215, 366, '1639992389'),
(216, 291, '1640766924'),
(217, 370, '1641025133'),
(218, 371, '1641058539'),
(219, 372, '1642030818'),
(220, 373, '1644386074'),
(221, 374, '1642600829'),
(222, 378, '1642851835'),
(223, 380, '1643336570'),
(224, 381, '1655955120'),
(225, 382, '1643540024'),
(226, 383, '1643706581'),
(227, 384, '1643709543'),
(228, 385, '1643710531'),
(229, 386, '1643711490'),
(230, 387, '1644091606'),
(231, 388, '1643820942'),
(232, 389, '1643885047'),
(233, 390, '1643893672'),
(234, 391, '1643986687'),
(235, 392, '1644069223'),
(236, 393, '1644070175'),
(237, 394, '1644071173'),
(238, 395, '1670237821'),
(239, 396, '1644397901'),
(240, 397, '1644791389'),
(241, 398, '1644859703'),
(242, 399, '1644874575'),
(243, 400, '1644892497'),
(244, 401, '1645119588'),
(245, 402, '1645183454'),
(246, 403, '1645564636'),
(247, 404, '1645970558'),
(248, 405, '1646086344'),
(249, 406, '1646514848'),
(250, 407, '1646790020'),
(251, 408, '1646880286'),
(252, 409, '1648538894'),
(253, 410, '1649842685'),
(254, 411, '1647970685'),
(255, 412, '1648048053'),
(256, 414, '1648115413'),
(257, 415, '1686300776'),
(258, 416, '1648214135'),
(259, 417, '1648280332'),
(260, 418, '1648639655'),
(261, 419, '1649279727'),
(262, 420, '1649280510'),
(263, 421, '1649303626'),
(264, 422, '1649305405'),
(265, 423, '1681579468'),
(267, 425, '1650293721'),
(268, 426, '1650389430'),
(269, 427, '1650459745'),
(270, 428, '1650896499'),
(271, 429, '1650981643'),
(272, 430, '1652085075'),
(273, 431, '1652281587'),
(274, 432, '1652313319'),
(275, 433, '1652353131'),
(276, 434, '1652420602'),
(277, 435, '1652491838'),
(278, 436, '1652705536'),
(279, 437, '1656063408'),
(280, 438, '1652727647'),
(281, 440, '1652956254'),
(282, 441, '1653378967'),
(284, 443, '1653504308'),
(285, 444, '1653527717'),
(286, 445, '1653734707'),
(287, 446, '1653926514'),
(288, 447, '1653940774'),
(289, 448, '1654013991'),
(290, 449, '1654341082'),
(291, 450, '1654358016'),
(292, 451, '1654588903'),
(293, 452, '1655655661'),
(294, 453, '1656033784'),
(296, 456, '1656923739'),
(297, 457, '1657192251'),
(298, 458, '1657117156'),
(300, 461, '1658171741'),
(301, 462, '1658679188'),
(302, 463, '1659258241'),
(303, 465, '1661369708'),
(304, 466, '1662554563'),
(305, 467, '1662805524'),
(306, 468, '1664865734'),
(307, 469, '1663629194'),
(310, 473, '1664794749'),
(311, 474, '1670068852'),
(322, 485, '1675405032'),
(324, 488, '1665651388'),
(325, 489, '1666361559'),
(326, 490, '1666361851'),
(327, 491, '1666427446'),
(328, 492, '1669652719'),
(330, 494, '1690870419'),
(331, 495, '1670431819'),
(333, 497, '1670714533'),
(334, 498, '1670732077'),
(335, 499, '1670771018'),
(336, 501, '1670783494'),
(337, 502, '1671027102'),
(338, 503, '1681440322'),
(339, 504, '1671285426'),
(340, 505, '1671301993'),
(341, 507, '1671624632'),
(342, 508, '1671703704'),
(343, 509, '1671868365'),
(344, 510, '1672206816'),
(345, 511, '1672206878'),
(346, 512, '1672226044'),
(347, 514, '1672260648'),
(348, 515, '1672261748'),
(349, 516, '1672306251'),
(350, 518, '1672385991'),
(351, 519, '1672865968'),
(352, 520, '1672966854'),
(353, 521, '1697293028'),
(354, 522, '1673927915'),
(355, 523, '1673610600'),
(356, 524, '1673641695'),
(357, 525, '1673807941'),
(358, 527, '1674094368'),
(359, 528, '1674205844'),
(360, 529, '1674245859'),
(361, 530, '1674555557'),
(362, 531, '1674562576'),
(363, 533, '1674950911'),
(364, 534, '1674830861'),
(365, 535, '1691922655'),
(366, 536, '1674903564'),
(367, 537, '1674973519'),
(368, 538, '1675069987'),
(369, 539, '1675148378'),
(370, 540, '1675169409'),
(371, 541, '1675235935'),
(372, 542, '1675240700'),
(373, 543, '1675244990'),
(374, 544, '1675277808'),
(375, 545, '1675331711'),
(376, 546, '1675364346'),
(377, 547, '1677452537'),
(378, 548, '1675454417'),
(379, 549, '1675489149'),
(380, 550, '1675517958'),
(381, 552, '1675545740'),
(382, 553, '1675607168'),
(383, 554, '1675711024'),
(384, 555, '1675742316'),
(385, 556, '1701950530'),
(386, 557, '1675758063'),
(387, 558, '1675813497'),
(388, 559, '1675945826'),
(389, 560, '1676010459'),
(390, 561, '1676030794'),
(391, 562, '1691575411'),
(392, 563, '1676032524'),
(393, 564, '1676033163'),
(394, 565, '1676054522'),
(396, 567, '1676279557'),
(397, 568, '1676287065'),
(398, 569, '1676302390'),
(399, 570, '1676307520'),
(400, 571, '1676378155'),
(401, 572, '1676493273'),
(402, 573, '1676524432'),
(403, 574, '1676529738'),
(404, 575, '1676531693'),
(405, 576, '1676604006'),
(406, 577, '1676666270'),
(407, 578, '1676841660'),
(408, 579, '1676999854'),
(409, 580, '1677077531'),
(410, 582, '1692742709'),
(411, 583, '1677368844'),
(412, 584, '1677452389'),
(413, 585, '1677548371'),
(414, 586, '1677620228'),
(415, 587, '1677718811'),
(416, 588, '1679768157'),
(417, 589, '1677919772'),
(418, 590, '1677937508'),
(419, 592, '1678013286'),
(420, 593, '1678189696'),
(421, 594, '1678347424'),
(422, 595, '1678581395'),
(423, 596, '1678678669'),
(424, 597, '1691763996'),
(425, 598, '1678704521'),
(426, 599, '1678966761'),
(427, 600, '1678983030'),
(428, 601, '1678999532'),
(429, 602, '1679033831'),
(430, 603, '1679403124'),
(431, 604, '1679638638'),
(432, 605, '1679659215'),
(433, 606, '1679768176'),
(434, 607, '1679916107'),
(435, 608, '1679916195'),
(436, 609, '1679940919'),
(437, 610, '1680094297'),
(438, 611, '1680094886'),
(439, 612, '1680121080'),
(440, 613, '1680180153'),
(441, 614, '1680585441'),
(442, 615, '1680303682'),
(443, 616, '1680508369'),
(444, 617, '1680536186'),
(445, 618, '1680539292'),
(446, 619, '1680628127'),
(447, 620, '1682296465'),
(448, 621, '1681468706'),
(449, 622, '1681737686'),
(450, 623, '1681893154'),
(451, 625, '1682037055'),
(452, 626, '1682091336'),
(453, 627, '1682096396'),
(454, 628, '1682111264'),
(455, 629, '1682930778'),
(456, 630, '1682451125'),
(457, 631, '1682510123'),
(458, 632, '1682610501'),
(459, 633, '1682840570'),
(460, 634, '1683031355'),
(461, 635, '1683310805'),
(462, 636, '1683513412'),
(463, 637, '1683513424'),
(464, 638, '1683692815'),
(465, 639, '1683713211'),
(466, 640, '1683713271'),
(467, 641, '1683808006'),
(468, 642, '1684118251'),
(469, 643, '1684175791'),
(470, 644, '1684440963'),
(471, 645, '1684772720'),
(472, 646, '1685671208'),
(473, 647, '1685272202'),
(474, 648, '1685352864'),
(475, 649, '1685382266'),
(476, 650, '1685450428'),
(477, 651, '1685652193'),
(478, 652, '1685985755'),
(479, 653, '1686205720'),
(480, 654, '1688515234'),
(481, 655, '1688589148'),
(482, 656, '1688623137'),
(483, 657, '1689140881'),
(484, 658, '1689158403'),
(485, 659, '1689286121'),
(486, 660, '1689298989'),
(487, 661, '1689401601'),
(488, 662, '1689681831'),
(489, 663, '1689878407'),
(490, 664, '1689914169'),
(491, 665, '1689935641'),
(492, 666, '1690076825'),
(493, 667, '1690387815'),
(494, 668, '1690470080'),
(495, 669, '1690484074'),
(496, 670, '1712289837'),
(497, 671, '1702964936'),
(498, 672, '1691576179'),
(499, 673, '1690961300'),
(500, 674, '1691499627'),
(501, 675, '1691510010'),
(502, 676, '1691575582'),
(503, 678, '1691601095'),
(504, 680, '1692212125'),
(505, 681, '1692311149'),
(506, 682, '1692592806'),
(507, 683, '1693979096'),
(508, 684, '1692948641'),
(509, 685, '1693171989'),
(510, 686, '1693179464'),
(511, 687, '1693404765'),
(512, 688, '1693438036'),
(513, 689, '1693470001'),
(514, 690, '1693829899'),
(515, 691, '1701446551'),
(516, 692, '1694360333'),
(517, 693, '1694359137'),
(518, 694, '1694359675'),
(519, 695, '1694755578'),
(520, 696, '1694869004'),
(521, 697, '1694908691'),
(522, 698, '1694957069'),
(523, 699, '1694984497'),
(524, 701, '1701712978'),
(525, 702, '1695389168'),
(526, 703, '1695463586'),
(527, 705, '1696010091'),
(528, 706, '1695744077'),
(529, 707, '1695917143'),
(530, 708, '1696213995'),
(531, 709, '1696234352'),
(532, 710, '1696337557'),
(533, 712, '1696628192'),
(534, 713, '1696743129'),
(535, 714, '1697019937'),
(536, 715, '1697027423'),
(537, 716, '1697175398'),
(538, 717, '1697603125'),
(539, 718, '1697625465'),
(540, 719, '1697764261'),
(541, 720, '1697908767'),
(542, 721, '1697964390'),
(543, 722, '1697986702'),
(544, 723, '1698002713'),
(545, 724, '1698066465'),
(546, 725, '1698455201'),
(547, 726, '1698470317'),
(548, 727, '1698488338'),
(549, 728, '1698834134'),
(550, 729, '1698856721'),
(551, 730, '1699456805'),
(552, 731, '1699684343'),
(553, 732, '1700189718'),
(554, 733, '1701843471'),
(555, 734, '1700665254'),
(556, 735, '1700678763'),
(557, 736, '1700913087'),
(558, 737, '1701060047'),
(559, 738, '1701062187'),
(560, 739, '1701070595'),
(561, 740, '1701202568'),
(562, 741, '1701262501'),
(563, 742, '1701317413'),
(564, 743, '1701846978'),
(565, 747, '1712228970'),
(566, 748, '1701950754'),
(567, 751, '1702965037'),
(568, 746, '1702965870'),
(569, 745, '1702966150'),
(570, 752, '1704272531'),
(571, 755, '1712313766'),
(572, 761, '1712602919'),
(573, 762, '1713192300'),
(574, 765, '1713192936'),
(575, 766, '1716471749'),
(576, 767, '1716917552'),
(577, 768, '1739389905'),
(578, 769, '1739524546'),
(579, 770, '1740486114'),
(580, 771, '1740485101'),
(581, 772, '1741369858'),
(582, 773, '1788978527'),
(583, 774, '1746815777'),
(584, 775, '1772461318'),
(585, 776, '1761577306'),
(586, 777, '1770845232'),
(587, 778, '1773347746'),
(588, 779, '1773681766'),
(589, 780, '1775746684'),
(590, 781, '1775760981'),
(591, 782, '1777580136'),
(592, 783, '1787836980'),
(593, 784, '1778005375'),
(594, 785, '1778961085'),
(595, 786, '1778962725'),
(596, 787, '1779457633'),
(597, 788, '1784140254'),
(598, 789, '1779910052'),
(599, 791, '1785441901'),
(600, 792, '1788372090');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tbl_admin`
--

CREATE TABLE `tbl_admin` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `email` varchar(200) NOT NULL,
  `image` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tbl_admin`
--

INSERT INTO `tbl_admin` (`id`, `username`, `password`, `email`, `image`) VALUES
(1, 'globaltecadm', '$argon2i$v=19$m=65536,t=4,p=1$c2FSY0RSeS44VHB0YkFJUw$tYCV0dkg8aid//RAMxpRYhjKZlcsZlfaL6GJGm0fUKA', 'DTI@globalteceducacional.com', '78548_logo_Globaltec 01.png');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tbl_author`
--

CREATE TABLE `tbl_author` (
  `author_id` int(11) NOT NULL,
  `author_name` varchar(255) NOT NULL,
  `author_image` varchar(255) NOT NULL,
  `author_description` longtext NOT NULL,
  `a_status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tbl_author`
--

INSERT INTO `tbl_author` (`author_id`, `author_name`, `author_image`, `author_description`, `a_status`) VALUES
(1, 'Edgar Allan Poe', '1660_edgar-allan-poe-19562.jpg', '<p>Edgar Allan Poe (1809-1849) foi um escritor, poeta, crítico literário e editor norte-americano, considerado uma das figuras mais importantes do Romantismo Sombrio. Sua obra, que abrange contos, poemas e ensaios, teve uma enorme influência na literatura mundial, especialmente nos gêneros de terror, mistério e ficção policial. </p><p>Fonte da imagem: Edgar Allan Poe (1809-1849), foto de Mathew Benjamin Brady, 1849, National Archives and Records Administration.</p>', 1),
(2, 'Adolfo Caminha', '51200_Adolfo_Caminha_II.jpg', '<p>Adolfo Caminha (1867-1897) foi um escritor brasileiro, um dos expoentes mais radicais e ousados do Naturalismo no Brasil. Sua obra chocou a sociedade da época ao abordar temas considerados tabus, como a homossexualidade, o racismo e a corrupção. </p><p><br />Fonte da imagem: pessoa retratada: Adolfo Caminha. Autor desconhecido, 1900.</p>', 1),
(3, 'Olavo Bilac', '36122_Olavo_Bilac_2.jpg', '<p>Olavo Brás Martins dos Guimarães Bilac (1865-1918) foi um poeta, jornalista e contista brasileiro, considerado o principal expoente do parnasianismo no Brasil. Conhecido como o “príncipe dos poetas brasileiros”, foi um dos membros fundadores da Academia Brasileira de Letras (ABL). Sua obra destaca-se pelo rigor formal, pela valorização da língua portuguesa e por temas que transitam entre o amor, o patriotismo e a mitologia. </p><p><strong>Fonte da imagem</strong>: Olavo Bilac,  Autor desconhecido, 1895.</p>', 1),
(4, 'Gonçalves Dias', '90134_Gonçalves_dias-(1).jpg', '<p>Antônio Gonçalves Dias foi um poeta, dramaturgo e etnólogo brasileiro, considerado um dos principais expoentes do romantismo e o poeta nacional do Brasil. Sua obra foi fundamental para a construção da literatura e da identidade cultural do país, principalmente por meio do indianismo, movimento do qual foi a principal voz. </p><p><strong>Fonte da imagem:</strong> Antônio Gonçalves Dias, autor desconhecido, 1855.</p>', 1),
(5, 'Maria Firmina dos Reis', '31746_Maria-Firmina.jpg', '<p>Maria Firmina dos Reis (1822–1917) foi uma escritora, poeta, compositora e professora maranhense, pioneira na literatura brasileira e na luta abolicionista. É considerada a primeira romancista do Brasil e a primeira mulher negra a publicar um romance em língua portuguesa no país: <em>Úrsula</em>, de 1859. </p><p><strong>Fonte da imagem: </strong>Retrato de Maria Fimina, gerado por inteligência artificial a partir de descrições históricas conhecidas.</p>', 1),
(6, 'Mary Shelley', '43909_MaryShelley.jpg', '<p>Mary Wollstonecraft Shelley (1797–1851) foi uma escritora, dramaturga, ensaísta e editora inglesa, mais conhecida por seu romance gótico <em>Frankenstein; ou, o Prometeu Moderno</em> (1818). Filha da feminista Mary Wollstonecraft e do filósofo William Godwin, Shelley foi uma figura central no círculo literário de sua época e uma das pioneiras da ficção científica. </p><p><strong>Fontes da imagem</strong>: Portrait of Mary Shelley (1797-1851), Richard Rothwell, National Portrait Gallery, 1840.</p>', 1),
(7, 'Bernardo Guimarães', '56069_Bernardo_Guimarães_(Iconográfico).jpg', '<p>Bernardo Guimarães (1825-1884) foi um romancista e poeta brasileiro da terceira fase do Romantismo. É mais conhecido por ser o autor de <em>A Escrava Isaura</em> (1875), obra que se tornou um símbolo da campanha abolicionista no Brasil. Ele também é considerado o introdutor do romance regionalista na literatura brasileira.</p><p><strong>Fonte da imagem:</strong> Bernardo Guimarães, M. J. Garnier, [189-?].</p>', 1),
(8, 'Graciliano Ramos', '4054_gracilaino-ramos.jpg', '<p>Graciliano Ramos foi um dos maiores escritores da segunda geração do modernismo brasileiro, conhecido por sua prosa seca, concisa e intimista. Em suas obras, retratou a dura realidade do sertão nordestino, a miséria, a seca e as injustiças sociais, dando voz a personagens marginalizados.</p><p>Fonte da imagem: Acervo Instituto de Estudos Brasileiros (IEB) da USP.</p>', 1),
(9, 'Casimiro de Abreu', '249_Casimiro_de_abreu.jpg', '<p>Casimiro de Abreu (1839-1860) foi um poeta brasileiro, representante da segunda geração do Romantismo, também conhecida como \\\"Ultrarromantismo\\\" ou \\\"Mal do Século\\\". Sua obra, de caráter ingênuo e sentimental, resgata a pureza da infância e a saudade da terra natal. Embora tenha vivido por um curto período, deixou uma marca significativa na literatura brasileira, sendo considerado um dos poetas mais populares do século XIX.</p><p><strong>Fonte da imagem:</strong> Casimiro de Abreau, Brazilian poet and writer, autor desconhecido.</p>', 1),
(10, 'Manuel Antônio de Almeida', '85171_Manuel_Antonio_de_Almeida.jpg', '<p>Manuel Antônio de Almeida foi um escritor e jornalista brasileiro (1831-1861), famoso por seu único romance, Memórias de um sargento de milícias. Publicado em folhetins, entre 1852 e 1853, o livro, que narra a vida do malandro Leonardo na sociedade carioca do início do século XIX, se distancia do Romantismo idealizante da época para retratar a realidade das classes populares de forma humorística e realista, sendo por isso considerado precursor do Realismo no Brasil. Sua carreira, que incluía a direção da Tipografia Nacional e a função de jornalista, foi interrompida tragicamente por um naufrágio em 1861. </p><p><strong>Fonte da imagem: </strong>Manuel Antônio de Almeida, autor desconhecido, Academia Brasileira de Letras, 1862.</p><div><div class=\\\"gtx-trans-icon\\\"> </div></div>', 1),
(11, 'Jacob Grimm', '36590_Jacob_Grimm_Friedlaender.jpg', '<p>Jacob Ludwig Karl Grimm (1785-1863) foi um filólogo, linguista, jurista, mitólogo e escritor alemão, mais conhecido como um dos Irmãos Grimm, ao lado de seu irmão Wilhelm. Ambos se tornaram mundialmente famosos pela coleta e publicação de contos populares, como “A Bela Adormecida”, “Branca de Neve” e “Cinderela”. </p><p> </p><p>Fonte da imagem: Jacob Grimm Friedlaender, Hessisches Staatsarchiv Marburg, 1857.</p>', 1),
(12, 'João Francisco Lisboa', '17286_João_Francisco_Lisboa.jpg', '<p>João Francisco Lisboa (1812-1863) foi um historiador, político e jornalista maranhense, mais conhecido por sua obra jornalística e pela escrita da <em>Crônica do Brasil Colonial</em>, sendo uma das maiores vozes do jornalismo brasileiro do século XIX. Autodidata, ele se destacou na política maranhense e na imprensa, notadamente com o periódico <em>O Jornal de Timon</em>, onde exercia sua crítica liberal. Seu trabalho, marcado pela erudição e pelo rigor histórico, o posicionou como uma figura intelectual de grande importância na época. Sua contribuição para a historiografia e para a literatura brasileira é reconhecida pela Academia Maranhense de Letras, da qual é patrono, e pela Academia Brasileira de Letras. </p><p> </p><p><strong>Fonte da imagem</strong>: João Francisco Lisboa, autor desconhecido, s.d..</p>', 1),
(13, 'Aluísio Azevedo', '62547_Aluisio_Azevedo.jpg', '<p>Aluísio Azevedo (1857-1913) foi um escritor, jornalista, diplomata e caricaturista maranhense, considerado o principal representante do Naturalismo no Brasil. Suas obras são marcadas por uma visão determinista do ser humano e por uma crítica social contundente, abordando temas como a miséria, o preconceito racial e a exploração social, como exemplificado em seus romances mais célebres: O Mulato (1881), que marcou o início do movimento no país e critica o racismo, e O Cortiço (1890), sua obra-prima que retrata a vida em uma habitação coletiva no Rio de Janeiro. Além de sua carreira literária, Azevedo também foi diplomata, ingressando na carreira em 1895, e atuou como um dos fundadores da Academia Brasileira de Letras. </p><p> </p><p><strong>Fonte da imagem: </strong>Aluísio Azevedo, autor desconhecido, 1880.</p>', 1),
(14, 'Júlia Lopes de Almeida', '12137_J&uacute;lia_Lopes_de_Almeida,_sem_data.jpg', '<p>Júlia Lopes de Almeida (1862–1934) foi uma das escritoras mais importantes e publicadas da Primeira República no Brasil. Jornalista, cronista, romancista e teatróloga, ela foi pioneira na luta pelos direitos das mulheres e na profissionalização da escrita feminina no país.</p><p> </p><p>Fonte da imagem: Júlia Lopes de Almeida, Fundo Correio da Manhã, Autor desconhecido, s.d..</p>', 1),
(15, 'Castro Alves', '54805_Alberto_Henschel_-_Castro_Alves.jpg', '<p>Antônio Frederico de Castro Alves (1847–1871) foi um poeta brasileiro, o maior representante da terceira geração romântica no Brasil, a geração condoreira, conhecida por sua poesia social e engajada. Devido à sua defesa fervorosa da causa abolicionista e republicana, ficou conhecido como o “Poeta dos Escravos”.<br /> </p><p>Fonte da imagem: Castro Alves, Alberto Henschel - Coleção G. Ermakoff <em>in</em> ERMAKOFF, 1870.</p>', 1),
(16, 'Coelho Neto', '26939_Henrique_Maximiano_Coelho_Neto.jpg', '<p>Henrique Maximiano Coelho Neto (1864–1934) foi um prolífico escritor, político, professor e jornalista maranhense, membro fundador da Academia Brasileira de Letras (ABL) e aclamado em sua época como o “Príncipe dos Prosadores Brasileiros”. Sua obra, vasta e multifacetada, mescla tendências do Realismo, Naturalismo, Parnasianismo e Gótico, sendo um autor de transição, enquadrado no período do Pré-Modernismo. </p><p>Fonte da imagem: Henrique Maximiano Coelho Neto, Arquivo ABL - Revista da ABL, 1920.</p>', 1),
(17, 'José de Alencar', '79644_Jose_de_Alencar.jpg', '<p>José de Alencar (1829–1877) foi um dos principais romancistas brasileiros e o principal representante do Romantismo no Brasil, célebre por sua prosa que buscava construir uma identidade nacional. Sua vasta obra abrange romances urbanos, históricos, regionalistas e indianistas, com destaque para “O Guarani”, “Iracema”, “Senhora” e “O Sertanejo”, solidificando as bases do romance brasileiro e introduzindo um projeto literário ufanista e nacionalista que idealizava a natureza e o indígena como símbolos da pátria.</p><p> </p><p>Fonte da imagem: José de Alencar. Alberto Henschel - Vasquez, Pedro Karp, 1870.</p>', 1),
(18, 'Artur Azevedo', '81067_Artur_Azevedo.jpg', '<p>Artur Azevedo (1855–1908) foi um dramaturgo, poeta, contista e jornalista maranhense, figura central na consolidação do teatro nacional brasileiro e um dos fundadores da Academia Brasileira de Letras (ABL). Conhecido como um \\\"homem do teatro\\\", ele se destacou na comédia de costumes e no teatro de revista, gêneros que utilizou para criticar e satirizar a sociedade e a política de sua época. <br /> </p><p>Fonte da imagem: Artur Azevedo, autor desconhecido, 1908.</p>', 1),
(19, 'Antônio de Alcântara Machado', '42211_Alcantara_Machado_foto.jpg', '<p>Antônio de Alcântara Machado (1901–1935) foi um escritor e jornalista modernista brasileiro, nascido em São Paulo. Ele foi uma figura importante na literatura brasileira do século XX, conhecido principalmente por sua contribuição para o movimento modernista, embora não tenha participado diretamente da Semana de Arte Moderna de 1922. Sua obra retratou a vida urbana de São Paulo e a imigração italiana com um estilo inovador e dinâmico, utilizando linguagem jornalística e gírias populares. </p><p>Fonte da Imagem: Retrato do escritor António de Alcântara Machado, https://pt.wikipedia.org/w/index.php?curid=5519456.</p>', 1),
(20, 'Adelina Lopes Vieira', '12410_Adelina_Lopes_Vieira.jpg', '<p>Adelina Lopes Vieira (1850–1923) foi uma importante escritora, poeta, contista e teatróloga brasileira. Nascida em Lisboa, mas radicada no Brasil desde a infância, ela foi uma das vozes femininas mais ativas do século XIX e início do XX, destacando-se especialmente na literatura infantil e na poesia lírica. </p><p>Fonte da Imagem: Adelina Lopes Vieira. Por M.J. Garnier - GARNIER, M.J. Adelina Lopes Vieira. Rio de Janeiro, RJ: F.Briguiet &amp; Cie. Editores, [189-?]. 1 des., pb.</p>', 1),
(21, 'Machado de Assis', '28882_Machado_de_Assis_by_Marc_Ferrez_-_Original.jpg', '<p>Joaquim Maria Machado de Assis é considerado o maior nome da literatura brasileira. Nascido no Rio de Janeiro, de origem humilde e mestiça, foi autodidata e alcançou prestígio como escritor, cronista, poeta e fundador da Academia Brasileira de Letras (ocupa a cadeira nº 23).</p><p>Fonte da Imagem: Retrato de Machado de Assis por Marc Ferrez.</p>', 1),
(22, 'Bruno Seabra', '61506_bruno_seabra3.jpg', '<p>Bruno Henrique de Almeida Seabra (1837–1876) foi um poeta lírico, romancista e folhetinista brasileiro. Embora tenha nascido no Pará, sua obra e trajetória são frequentemente associadas à produção literária do século XIX que circulava no Rio de Janeiro e em outras capitais brasileiras. <br /> </p><p>Fonte da imagem: Bruno Henrique de Almeida Seabra, Bilhete Postal M. Orosco &amp; C., [1905].</p>', 1),
(23, 'William Shakespeare', '66998_william-shakespeare-c-1611-20200.jpg', '<p>William Shakespeare (1564–1616) foi um dramaturgo, poeta e ator inglês, amplamente considerado o maior escritor da língua inglesa e um dos mais importantes nomes da literatura mundial. Nascido em Stratford-upon-Avon, Shakespeare destacou-se pela sua capacidade de criar obras que abordam temas universais, como o amor, o poder, a ambição, a loucura, a moralidade e a condição humana.</p><p> </p><p>Fonte da Imagem: William Shakespeare, John Taylor, 1611. National Portrait Gallery.</p><div><div class=\\\"gtx-trans-icon\\\"> </div></div>', 1),
(24, 'Afonso Arinos', '86552_Afonso_Arinos_(o_Contradador_de_Diamantes)_(cropped).jpg', '<p>Afonso Arinos (1868–1916), nome completo Afonso Arinos de Melo Franco, foi um escritor e jornalista brasileiro, um dos precursores do Pré-Modernismo e um dos grandes representantes do regionalismo mineiro. Sua obra teve grande importância na busca por uma identidade cultural brasileira, abordando a paisagem física e humana do interior de Minas Gerais.</p><p> </p><p>Fonte da imagem: Affonso Arinos, Capa da obra O contratador de Diamantes, 1910s.</p>', 1),
(25, 'Irmãos Grimm', '71626_Jacob_und_Wilhelm_Grimm.jpg', '<p>Jacob Ludwig Karl Grimm (1785–1863) e Wilhelm Karl Grimm (1786–1859), conhecidos como os Irmãos Grimm, foram acadêmicos, linguistas e folcloristas alemães. Eles são mundialmente famosos por compilarem e publicado contos populares que se tornaram clássicos da literatura infantil e da cultura ocidental. <br /> </p><p>Fonte da imagem: Jacob e Wilhelm Grimm, Ludwig Emil Grimm, 1843.</p>', 1),
(26, 'Aderbal de Carvalho', '15610_Adherbal_de_Carvalho_(Iconográfico).jpg', '<p>Aderbal de Carvalho (1862–1915) foi um escritor, advogado e professor maranhense que se destacou como um dos nomes fundamentais do Realismo e Naturalismo no Brasil, especialmente por sua atuação crítica e literária no final do século XIX.</p><p> </p><p>Fonte da imagem: Adherbal de Carvalho (Iconográfico), M.J. Garnier, [189?].</p>', 1),
(27, 'Adolfo Coelho', '97451_Francisco_Adolfo_Coelho.jpg', '<p>Adolfo Coelho (1847–1919) foi um filólogo e etnógrafo português fundamental para o estudo científico do folclore e da língua portuguesa. Como pedagogo, defendeu a modernização do ensino e, em sua obra literária, destacou-se pela coleta rigorosa de tradições orais em livros como Contos Populares Portugueses (1879).<br /> </p><p>Fonte da imagem: Francisco Adolfo Coelho, Revista da Faculdade de Letras, 1934.</p>', 1),
(28, 'Afonso Celso', '20538_Afonso_Celso.jpg', '<p>Afonso Celso de Assis Figueiredo Júnior, o Afonso Celso (1860–1938), foi um professor, poeta, historiador e político brasileiro, reconhecido como um dos fundadores da Academia Brasileira de Letras.</p><p>Fonte da imagem: Afonso Celso, Revista Moderna, 1899.</p>', 1),
(29, 'Alberto de Oliveira', '1429_Alberto_de_Oliveira_(Iconográfico).jpg', '<p>Alberto de Oliveira (1857–1937) foi um poeta, professor e farmacêutico brasileiro, consagrado como um dos mestres do Parnasianismo no Brasil, ao lado de Olavo Bilac e Raimundo Correia (a “Trindade Parnasiana”). </p><p> </p><p>Fonte da imagem: Alberto de Oliveira, M. J. Garnier, [189-?].</p>', 1),
(30, 'Alexandre Herculano', '47151_Alexandre_Herculano.jpg', '<p>Alexandre Herculano (1810–1877) foi um escritor, historiador, jornalista e poeta português, considerado o introdutor do Romantismo e do romance histórico em Portugal.</p><p> </p><p>Fonte da Imegm: Alexandre Herculano, José Rodrigues, s.d..</p>', 1),
(31, 'Álvares de Azevedo', '48768_Álvares_de_Azevedo.jpg', '<p>Manoel Antônio Álvares de Azevedo (1831–1852) foi um escritor, poeta e contista brasileiro, principal expoente da Segunda Geração Romântica (Ultra-Romantismo ou “Mal do Século”) no Brasil. Sua obra é marcada por um profundo dualismo: oscila entre o sentimentalismo melancólico, marcado pelo desejo de morte e pela idealização feminina, e o tom irônico, sarcástico e macabro. Influenciado por Lord Byron e Musset, Azevedo explorou temas como o tédio, o sonho e o fantástico. Faleceu precocemente aos 20 anos, deixando uma produção literária vasta publicada postumamente, da qual se destacam “Lira dos Vinte Anos” e “Noite na Taverna”.<br /> </p><p>Fonte da imagem: Álvares de Azevedo, autor desconhecido, 1850.</p>', 1),
(32, 'Humberto de Campos', '33665_Humberto_de_Campos_(1926).jpg', '<p>Humberto de Campos Veras (1886–1934) foi um jornalista, político e escritor maranhense, um dos autores mais lidos e populares do Brasil nas décadas de 1920 e 1930. Membro da Academia Brasileira de Letras, destacou-se por suas crônicas irônicas, contos e memórias, utilizando muitas vezes o pseudônimo Conselheiro XX. Sua obra é marcada por um estilo leve, de grande apuro linguístico e teor anedótico, sendo Memórias (1933) sua produção mais aclamada pela crítica. Após sua morte, seu nome tornou-se centro de uma famosa disputa jurídica envolvendo a Federação Espírita Brasileira e o médium Chico Xavier, que alegava psicografar mensagens do autor. </p><p>Fonte da imagem: Humberto de Campos Veras, imagem do Fundo Correio da Manhã, autor desconhecido - Arquivo Nacional, 1926.</p>', 1),
(33, 'Inglês de Sousa', '88094_Ingl&ecirc;s_de_Souza.jpg', '<p>Herculano Marcos Inglês de Sousa (1853–1918) foi um escritor, advogado e político paraense, considerado um dos pioneiros do Naturalismo no Brasil. Membro fundador da Academia Brasileira de Letras, sua obra é marcada pelo forte regionalismo e pela análise determinista do comportamento humano, ambientando suas tramas na região amazônica.</p><p>Fonte da imagem: Herculano Marcos Inglês de Sousa, Academia Brasileira de Letras, 1910.</p>', 1),
(34, 'João do Rio', '41334_João_do_Rio_1921.jpg', '<p>João Paulo Emílio Cristóvão dos Santos Coelho Barreto, conhecido pelo pseudônimo João do Rio (1881–1921), foi um jornalista, cronista, tradutor e teatrólogo brasileiro, figura central da Belle Époque carioca. </p><p> </p><p>Fonte da imagem: João do Rio, Autor Desconhecido - Hemeroteca Digital (Biblioteca Nacional), 1921.</p>', 1),
(35, 'Joaquim Manuel de Macedo', '73574_Joaquim_Manuel_de_Macedo_1866.jpg', '<p>Joaquim Manuel de Macedo (1820–1882) foi um escritor, médico, professor e político brasileiro, reconhecido como um dos fundadores do romance no Brasil e principal expoente do Romantismo urbano.</p><p>Fonte da imagem: Joaquim Manuel de Macedo, autor desconhecido, 1866.</p>', 1),
(36, 'Joaquim Nabuco', '84388_Joaquim_Nabuco_-_1902.jpg', '<p>Joaquim Aurélio Barreto Nabuco de Araújo, conhecido como Joaquim Nabuco (1849–1910), foi um político, diplomata, historiador e jurista pernambucano, figura central da luta pelo abolicionismo no Brasil. Fundador da Academia Brasileira de Letras, Nabuco foi um dos maiores intelectuais do Segundo Reinado, defendendo que a escravidão corrompia todas as instituições do país. Sua obra fundamental, O Abolicionismo (1883), serviu como base teórica para o movimento que culminou na Lei Áurea.</p><p> </p><p>Fonte da imagem: Joaquim Nabuco, Fundação Joaquim Nabuco, 1902.</p>', 1),
(37, 'Agostinho', '92766_Santo_Agostinho,_Bispo_de_Hipona_e_Doutor_da_Igreja.jpg', '<p>Agostinho de Hipona, conhecido como Santo Agostinho (354–430), foi um teólogo, filósofo e bispo africano, cuja obra é o alicerce do pensamento cristão ocidental e da Patrística. Sua filosofia realizou a síntese entre a fé cristã e o platonismo, explorando temas como o livre-arbítrio, o pecado original e a relação entre o tempo e a eternidade. </p><p>Fonte da imagem: Santo Agostinho, autor desconhecido, 1950.</p>', 1),
(38, 'Homero', '32039_Homero.jpg', '<p>Homero foi um poeta épico da Grécia Antiga a quem se atribui a autoria da Ilíada e da Odisseia, obras fundamentais da literatura ocidental. Embora sua existência histórica seja debatida (a chamada “Questão Homérica”), ele é tradicionalmente descrito como um aedo (poeta cantor) cego que viveu por volta do século VIII a.C. </p><p>Fonte da imagem: Retrato de Homero. Gerado via inteligência artificial generativa pelo modelo Gemini (Google).</p>', 1),
(39, 'Esopo', '86749_Esopo.jpg', '<p>Esopo foi um escritor da Grécia Antiga a quem se atribui a criação do gênero da fábula. Segundo a tradição, ele teria sido um escravo liberto que utilizava narrativas curtas protagonizadas por animais antropomorfizados para transmitir ensinamentos morais e críticas sociais de forma indireta.</p><p>Fonte da imagem: Esopo, Diego Velázquez, 1638.</p><div><div class=\\\"gtx-trans-icon\\\"> </div></div>', 1),
(40, 'Miguel de Cervantes', '30733_Miguel_de_Cervantes_(Museo_del_Prado).jpg', '<p>Miguel de Cervantes foi o maior escritor da literatura espanhola e um dos principais nomes da literatura mundial. Sua obra-prima, Dom Quixote, é considerada o primeiro romance moderno, parodiando as novelas de cavalaria e explorando a dualidade entre idealismo e realidade.</p><p>Fonte da imagem: Miguel de Cervantes, Eduardo Balaca - Museo del Prado, 1877.</p>', 1),
(41, 'Virgílio', '71501_Virgil_.jpg', '<p>Públio Virgílio Marão (70 a.C.–19 a.C.) foi o maior poeta da Roma Antiga e uma das figuras mais influentes da literatura ocidental. </p><p>Fonte da imagem: Públio Virgílio Marão, autor desconhecido, 1850.</p>', 1),
(42, 'Públio Ovídio Naso', '17703_Publius_Ovidius_Naso_in_the_Nuremberg_chronicle_XCIIIv.jpg', '<p>Públio Ovídio Naso foi um dos poetas mais versáteis e influentes da Roma Antiga, completando a tríade da poesia latina ao lado de Virgílio e Horácio. </p><p>Fonte da imagem: Públio Ovídio Naso, Michel Wolgemut, Wilhelm Pleydenwurff, 1493.</p>', 1),
(43, 'Dante Alighieri', '27715_Dante_Alighieri&#039;s_portrait_by_Sandro_Botticelli.jpg', '<p>Dante Alighieri foi um poeta, escritor e político florentino, considerado o “Pai da Língua Italiana” e um dos principais nomes da literatura universal.</p><p>Fonte da imagem: Dante Alighieri, After Sandro Botticelli, 1495.</p>', 1),
(44, 'Gil Vicente', '48347_Gil_Vicente_(1882)_-_António_Nunes_Junior_(Paços_do_Concelho_de_Lisboa).jpg', '<p>Gil Vicente é a figura maior do teatro português, a quem se atribui a fundação da dramaturgia nacional.</p><p>Fonte da imagem: Gil Vicente, António Nunes Júnior - Arquivo Municipal de Lisboa, 1882.</p>', 1),
(45, 'Emily Brontë', '5336_Emily_Bront&euml;_by_Patrick_Branwell_Bront&euml;_restored.jpg', '<p>Emily Brontë foi uma escritora e poeta britânica, uma das três famosas irmãs Brontë. Sua única obra em prosa, O Morro dos Ventos Uivantes, publicada originalmente sob o pseudônimo Ellis Bell, é considerada um dos principais clássicos da literatura mundial e uma obra-prima do Romantismo tardio e do Gótico.</p><p>Fonte da imagem: Emily Brontë, Patrick Branwell Brontë, 1848.</p>', 1),
(46, 'François Rabelais', '65976_Francois_Rabelais_-_Portrait.jpg', '<p>François Rabelais (c. 1494–1553) foi uma das figuras mais proeminentes do Renascimento francês, desempenhando funções como escritor, médico e religioso. O seu trabalho representa um divisor de águas na passagem da Idade Média para a Modernidade, sendo amplamente reconhecido como o primeiro notável escritor de prosa da França.</p><p>Fonte da imagem: Francois Rabelais, autor desconhecido, 1501-1600.</p>', 1),
(47, 'Cristóvão Falcão', '73404_cristovao_falcao.jpg', '<p>Cristóvão Falcão (1512 - 1557), poeta e diplomata português do século XVI. Por vezes, o seu nome é referido como tendo sido Cristóvão Falcão de Sousa ou Cristóvão de Sousa Falcão. O nome próprio aparece por vezes com a grafia arcaica de Christóvão.</p><p>Fonte da imagem: Cristóvão Falcão, autor desconhecido, s.d..</p>', 1),
(48, 'Luís de Camões', '35986_Lu&iacute;s_de_Cam&otilde;es_por_Fran&ccedil;ois_G&eacute;rard.jpg', '<p>Luís Vaz de Camões (1524-1580) é reconhecido como o poeta de maior destaque na língua portuguesa e o símbolo máximo do Renascimento em Portugal. Sua vida foi tão épica quanto seus versos: foi soldado em Ceuta, sobreviveu a naufrágios no Oriente e faleceu na pobreza absoluta em Lisboa. </p><p>Fonte da imagem: Luís de Camões, François Gérard, s.d..</p>', 1),
(49, 'Padre Antônio Vieira', '14173_Padre_Ant&oacute;nio_Vieira_(s&eacute;c._XVII)_-_Escola_Espanhola_ou_Portuguesa.jpg', '<p>O Padre Antônio Vieira (1608–1697) se destacou como a personalidade mais notável do Barroco em Portugal. Jesuíta, diplomata e orador sacro, ele é chamado por Fernando Pessoa de “o Imperador da Língua Portuguesa” pela sua habilidade retórica inigualável. </p><p>Fonte da imagem: António Vieira, autor desconhecido, 1650.</p>', 1),
(50, 'Jean de La Fontaine', '20751_Jean_de_La_Fontaine.jpg', '<p>Jean de La Fontaine é considerado o pai da fábula contemporânea, convertendo narrativas de animais em uma crítica sofisticada à sociedade francesa do século XVII. A sua obra literária recorre ao antropomorfismo (animais com traços humanos) para proporcionar lições morais que, na realidade, satirizam a corte, a vaidade e a essência humana. Ao contrário de seus predecessores, ele elevou a fábula à categoria de alta poesia, combinando uma narrativa simples com uma técnica perfeita, o que o tornou um dos escritores mais lidos e influentes do Classicismo.<br /> </p><p>Fonte da imagem: Jean de La Fontaine, autor desconhecido, s.d..</p>', 1),
(51, 'Charles Perrault', '98238_Portrait_de_Charles_Perrault_par_Charles_Le_Brun.jpg', '<p>Charles Perrault foi o pai da literatura infantil moderna, sendo o responsável por fixar o gênero dos contos de fadas como o conhecemos hoje. No século XVII, ele recolheu histórias da tradição oral e as adaptou para a corte francesa em sua obra Contos da Mamãe Gansa, dando forma definitiva a clássicos como Cinderela, O Gato de Botas, A Bela Adormecida e Chapeuzinho Vermelho. Sua grande marca literária foi a introdução de uma moralidade ao final de cada narrativa, equilibrando o elemento fantástico com lições de etiqueta e comportamento social típicas do Classicismo.</p><p>Fonte da imagem: Charles Perrault, Charles Le Brun, 1670.</p>', 1),
(52, 'Lima Barreto', '16075_Lima_Barreto.jpg', '<p>Lima Barreto (1881–1922) foi um notável cronista do subúrbio do Rio de Janeiro e um fervoroso crítico das injustiças da Primeira República, desempenhando um papel crucial no Pré-Modernismo do Brasil. Negro, de origem humilde e afastado da elite literária de seu tempo, ele empregou uma linguagem direta e jornalística para expor o racismo estrutural, a hipocrisia social e o desprezo pelas classes menos favorecidas. Sua obra-prima, “Triste Fim de Policarpo Quaresma\\\", sintetiza seu estilo ao satirizar um nacionalismo ingênuo e utópico, enquanto contos como “O Homem que Sabia Javanês” expõem a farsa intelectual da sociedade. Apesar de ter sofrido com o alcoolismo e internações psiquiátricas, Lima Barreto deixou um legado essencial de resistência e realismo crítico que só foi plenamente reconhecido décadas após sua morte.<br /> </p><p>Fonte da imagem: Lima Barreto, da ficha de internação no Hospício Nacional de Alienados, s.d..</p>', 1),
(53, 'Monteiro Lobato', '16633_Monteiro_Lobato.jpg', '<p>José Bento Monteiro Lobato (1882–1948) foi um dos escritores e influenciadores mais importantes do Brasil. Ele é o “pai” da literatura infantil brasileira e um fervoroso defensor do desenvolvimento nacional. </p><p>Fonte da imagem: Monteiro Lobato, autor desconhecido, publicado na coleção “Nosso Século”, 1980.</p>', 1),
(54, 'Victor Hugo', '54773_Victor_Hugo_by_&Eacute;tienne_Carjat_1876_-_full.jpg', '<p>Victor Hugo é uma das mais celebradas personalidades francesas. Foi pensador, crítico, poeta, dramaturgo, romancista, político e artista plástico. Autor de um sem número de poemas, romances engajados, peças de teatro, ensaios críticos sobre literatura e dramaturgia, além de escritos políticos, seu vasto legado intelectual transformou-o, ainda em vida, em um herói nacional.</p><p>Expoente do romantismo francês, a obra e a vida pública de Victor Hugo foram dedicadas a temas como a desigualdade social e a luta em prol dos direitos civis.</p><p> </p><p>LUIZA BRANDINO. <strong>Victor Hugo: biografia, características, frases</strong>. Brasil Escola.</p><p>Fonte da imagem: Victor Hugo, Étienne Carjat, 1876.</p><p>‌</p><div><div class=\\\"gtx-trans-icon\\\"> </div></div>', 1),
(55, 'França Júnior', '35210_Joaquim_Jos&eacute;_da_Franca_J&uacute;nior-0000.jpg', '<p>Joaquim José da França Júnior (1838–1890) foi um talentoso dramaturgo, jornalista e pintor brasileiro, considerado o principal sucessor de Martins Pena na comédia de costumes no Brasil. Ele se destacou por retratar com humor e ironia a sociedade carioca do Segundo Reinado, focando especialmente na classe média e na burocracia imperial.</p><p>Fonte da imagem: Joaquim José da Franca Júnior, autor desconhecido, s.d..</p><div><div class=\\\"gtx-trans-icon\\\"> </div></div>', 1),
(56, 'Mário de Andrade', '6149_Mario_de_andrade_1928b.jpg', '<p>Mário de Andrade (1893–1945) desempenhou um papel crucial na fundação do Modernismo no Brasil. Diferente de Gonçalves Dias, que buscava um herói idealizado, Mário queria entender o Brasil real, “desvairado” e multifacetado, fundindo a erudição com o folclore popular.</p><p>Fonte da imagem: Mário de Andrade, Michelle Rizzo, 1928. </p>', 1),
(57, 'Júlio Verne', '2506_Jules_Verne_in_1892.jpg', '<p>Júlio Verne (1828–1905) foi um célebre escritor francês e um dos grandes pioneiros da ficção científica, famoso por antecipar inovações tecnológicas como o submarino, o helicóptero e as viagens espaciais décadas antes de suas invenções reais. Integrante da prestigiada coleção de aventuras Viagens Extraordinárias, sua vasta obra combina rigor científico com narrativas fantásticas, imortalizada em clássicos mundiais como Vinte Mil Léguas Submarinas, A Volta ao Mundo em 80 Dias e Viagem ao Centro da Terra.</p><p>Fonte da imagem: Jules Verne, Ch. Herbert, Amiens, 1892.</p>', 1),
(58, 'Hans Christian Andersen', '82740_Hans_Christian_Andersen_by_Thora_Hallager_1869.jpg', '<p>Hans Christian Andersen (1805–1875) foi um renomado escritor dinamarquês, amplamente considerado o pai da literatura infantil moderna. Ao contrário dos Irmãos Grimm, que compilavam o folclore oral, Andersen destacou-se como um criador original de fábulas. Suas histórias romperam com o moralismo rígido da época, misturando melancolia, ironia e sensibilidade para tocar o coração de crianças e adultos.</p><p>Fonte da imagem: Hans Christian Andersen, Thora Hallager, 1869.</p>', 1),
(59, 'Lewis Carroll', '3523_LewisCarrollSelfPhoto.jpg', '<p>Lewis Carroll (Charles Lutwidge Dodgson) foi um brilhante polímata vitoriano que imortalizou seu nome na história cultural ao entrelaçar o rigor da lógica matemática com o puro absurdo da literatura nonsense. Como docente em Oxford e precursor da fotografia, ele empregava trocadilhos, jogos de xadrez estruturais e paradoxos geométricos para desafiar as estritas normas sociais de seu tempo. Ele converteu clássicos como Alice no País das Maravilhas em intrincados enigmas intelectuais que persistem em cativar acadêmicos e leitores de qualquer idade.</p><p>Fonte da imagem: Lewis Carroll, Stuart Dodgson, 1898.</p>', 1),
(60, 'Leandro Gomes de Barros', '73096_Leandro_Gomes_de_Barros.jpg', '<p>Leandro Gomes de Barros (1865–1918) foi um escritor brasileiro, consagrado como o primeiro escritor de literatura de cordel do Brasil e o principal consolidador desse gênero literário. Ele é amplamente reconhecido por transformar as histórias orais dos cantadores nordestinos em folhetos impressos, criando a estrutura clássica de comercialização e métrica do cordel. Sua genialidade foi exaltada por grandes nomes da literatura, incluindo Carlos Drummond de Andrade, que o coroou como o “Rei dos Poetas Populares”.</p><p>Fonte da imagem: Leandro Gomes de Barros, autor deconhecido, início do século XX.</p>', 1),
(61, 'Silvino Pirauá de Lima', '52657_SILVINO-PIRAU&Aacute;-DE-LIMA.jpg', '<p>Silvino Pirauá de Lima (1848–1913) foi um dos principais pioneiros e mestres da Literatura de Cordel e da cantoria de viola no Brasil. Com seu contemporâneo Leandro Gomes de Barros, ele participou diretamente da transição da poesia puramente oral e improvisada para os folhetos impressos, consolidando o gênero no Nordeste.</p><p>Fonte da imagem: Silvino Pirauá de Lima, autor desconhecido, s.d..</p>', 1),
(62, 'João Melquiades Ferreira', '53758_Joao_Melchiades.jpg', '<p>João Melquíades Ferreira da Silva (1869–1933), popularmente conhecido como “O Cantor da Borborema”, foi um dos mais destacados poetas, cantadores e folheteiros da primeira geração da Literatura de Cordel no Brasil.</p><p>Fonte da imagem: João Melchíades Ferreira da Silva, autor desconhecido, 1933.</p>', 1),
(63, 'Alexandre Dumas, filho', '27087_ADumas_hijo_00.jpg', '<p>Alexandre Dumas, filho (1824–1895), foi um célebre escritor, romancista e dramaturgo francês, reconhecido como um dos grandes nomes da literatura do século XIX. Filho do também gigante da literatura Alexandre Dumas (autor de Os Três Mosqueteiros), o “filho” distinguiu-se do pai ao afastar-se dos romances históricos e de aventura para se tornar um dos precursores do Realismo e do teatro de tese na França, focando nas complexidades sociais e nos dilemas morais da sua época.</p><p> </p><p>Fonte da imagem: Alexandre Dumas filho, autor desconhecido, 1850.</p>', 1),
(64, 'Camilo Pessanha', '63839_Camilo_Pessanha.jpg', '<p>Camilo de Almeida Pessanha (1867–1926) foi um dos poetas mais singulares da língua portuguesa, aclamado como o expoente máximo do Simbolismo em Portugal. Dono de uma sensibilidade melancólica extrema e musicalidade incomparável, sua escrita antecipou elementos fundamentais do Modernismo.</p><p>Fonte da imagem: Camilo Pessanha, autor desconhecido, Biblioteca Nacional de Portugal (BNP), s.d..</p>', 1),
(65, 'Chiquinha Gonzaga', '66565_Design-sem-nome.jpg', '<p>Chiquinha Gonzaga (1847–1935) foi uma das mais importantes compositoras da história da música brasileira e a primeira maestrina de destaque do país. Pioneira na valorização da música popular, destacou-se por obras que marcaram o teatro de revista, as polcas, os maxixes e as marchinhas carnavalescas, além de romper barreiras em uma sociedade que restringia a atuação feminina. Sua produção musical contribuiu para a consolidação da identidade cultural brasileira e influenciou gerações de artistas, tornando-a um dos principais símbolos da música nacional.</p><p>Fonte da imagem: Chiquinha Gonzaga, autor deconhecido, 1877.</p>', 1),
(66, 'Euclides da Cunha', '6191_Euclides_da_Cunha.jpg', '<p>Euclides da Cunha (1866–1909) foi um escritor, engenheiro e jornalista brasileiro, imortalizado na literatura mundial por sua obra-prima Os Sertões (1902), que mistura rigor científico, sociologia e literatura para narrar com profundidade a Guerra de Canudos. Membro da Academia Brasileira de Letras, sua escrita inovadora e de forte denúncia social inaugurou o Pré-Modernismo no Brasil, revelando ao país o isolamento, a miséria e a resiliência do sertanejo, a quem definiu no célebre aforismo: “O sertanejo é, antes de tudo, um forte”.</p><p> </p><p>Fonte da imagem: Euclides da Cunha, Autor desconhecido, 1900.</p>', 1),
(67, 'Paulo Setúbal', '1890_Paulo_Set&uacute;bal_circa_1920.jpg', '<p>Paulo Setúbal (1893–1937) foi um influente escritor, advogado e político paulista, membro da Academia Brasileira de Letras, que se consagrou na literatura nacional por meio de seus romances históricos de grande sucesso popular, como A Marquesa de Santos e As Maluquices do Imperador.</p><p>Fonte da imagem: Paulo de Oliveira Leite Setúbal, Revista A Cigarra, Arquivo do Estado de São Paulo, 1920.</p>', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tbl_books`
--

CREATE TABLE `tbl_books` (
  `id` int(11) NOT NULL,
  `cat_id` varchar(250) NOT NULL,
  `section_ids` text DEFAULT NULL COMMENT 'IDs das seções onde o livro aparece (ex: 1,5,12)',
  `aid` int(11) NOT NULL,
  `featured` int(1) NOT NULL DEFAULT 0,
  `book_title` varchar(100) NOT NULL,
  `book_description` longtext NOT NULL,
  `book_cover_img` varchar(255) NOT NULL,
  `book_file_type` varchar(255) NOT NULL,
  `book_file_url` varchar(255) NOT NULL,
  `total_rate` int(11) NOT NULL DEFAULT 0,
  `rate_avg` varchar(255) NOT NULL DEFAULT '0',
  `book_views` int(11) NOT NULL DEFAULT 0,
  `status` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tbl_books`
--

INSERT INTO `tbl_books` (`id`, `cat_id`, `section_ids`, `aid`, `featured`, `book_title`, `book_description`, `book_cover_img`, `book_file_type`, `book_file_url`, `total_rate`, `rate_avg`, `book_views`, `status`) VALUES
(4, '6', NULL, 4, 0, 'Primeiros Cantos', '<p>Primeiros Cantos (1847), de Gonçalves Dias, é a obra inaugural da primeira geração do Romantismo brasileiro, destacando-se pela exaltação do Indianismo e da natureza nacional como elementos fundamentais para a construção da identidade brasileira, sendo o indígena idealizado como herói. Além do nacionalismo, o livro apresenta um intenso lirismo amoroso e melancólico, marcado pelo sofrimento e frustração do eu lírico, e uma forte religiosidade, consolidando as bases temáticas e estilísticas do movimento romântico no Brasil.</p>', '78760_Primeiros-Cantos---Gonçalves-Dias.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/71805_Primeiros-Cantos---Gonçalves-Dias.pdf', 2, '4.5', 131, 0),
(5, '6', '27,71', 4, 0, 'Segundos Cantos', '<p>Segundos Cantos (1848), a segunda coletânea de Gonçalves Dias, dá continuidade aos temas românticos, mas com um notável aprofundamento do lirismo amoroso e da melancolia pessoal, que se torna mais pessimista e dolorosa. Embora mantenha o tom nacionalista, a obra foca menos no Indianismo grandioso de “Primeiros Cantos” e inclui também composições de caráter histórico e religioso, como as “Sextilhas de Frei Antão”, evidenciando a diversidade de temas do poeta, mas mantendo a tônica do sofrimento e da idealização.</p>', '99386_Segundos-Cantos---Gonçalves-Dias.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/31469_Segundos-Cantos---Gonçalves-Dias.pdf', 1, '5', 17, 0),
(6, '6', '27,71', 4, 1, 'Novos Cantos', '<p>Novos Cantos (1853) é uma coletânea poética que dá continuidade à produção de Gonçalves Dias, servindo como um elo entre seus trabalhos anteriores e os póstumos, na qual o poeta amadurece e intensifica as temáticas do Romantismo. A obra mantém a exaltação do Indianismo e da natureza brasileira, mas aprofunda o lirismo amoroso e o sentimentalismo, marcados pela saudade, pelo pessimismo e pela reflexão existencial sobre a efemeridade da vida e a aproximação da morte. </p>', '1128_Novos-Cantos---Gonçalves-Dias.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/8262_Novos-Cantos---Gonçalves-Dias.pdf', 1, '5', 10, 1),
(7, '6', '66,53,27', 4, 1, '&Uacute;ltimos Cantos', '<p>Últimos Cantos (1851) é a terceira coletânea poética de Gonçalves Dias e representa o auge e a síntese de sua obra romântica, reforçando o binômio Indianismo-Nacionalismo e a desilusão pessoal. A obra se destaca por poemas épicos de temática indígena, como o célebre “I-Juca-Pirama”, que exalta a coragem e a dignidade do guerreiro tupi em seu canto de morte, e pela manutenção do lirismo, que aqui se torna mais amargo e doloroso, refletindo a desilusão do poeta com o amor frustrado, a fragilidade da saúde e as dificuldades da vida.</p>', '63954_Ultimos-Cantos---Gonçalves-Dias.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/7093_Últimos-Cantos---Gonçalves-Dias.pdf', 1, '5', 7, 1),
(8, '6', '53', 4, 1, 'I-Juca-Pirama', '<p>I-Juca-Pirama é o poema épico indianista de Gonçalves Dias, cujo título significa “Aquele que vai ser morto”. Narra a captura de um jovem guerreiro Tupi, que implora por sua vida para cuidar de seu pai cego. Por essa súplica, é humilhado pelos inimigos Timbiras e amaldiçoado pelo próprio pai por covardia. Para reverter a desonra, o jovem enfrenta sozinho toda a tribo, provando sua coragem. O chefe Timbira, admirado, o liberta, permitindo a reconciliação com o pai. O poema é a maior exaltação do indígena como o herói nacional idealizado no Romantismo brasileiro.</p>', '72509_I-Juca-Pirama---Gon&ccedil;alves-Dias.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/49504_I-Juca-Pirama---Gonçalves-Dias.pdf', 2, '4.5', 25, 1),
(9, '6', '52,27', 5, 0, 'Cantos &agrave; beira-mar (Edi&ccedil;&atilde;o Comentada pelo Prof. J&aacute;der Cavalcante)', '<p>Cantos à beira-mar (1871) é a única coletânea poética de Maria Firmina dos Reis, destacando-se no Romantismo brasileiro por mesclar um profundo lirismo subjetivo, em que o mar e a natureza servem de palco para a melancolia, solidão e idealismo amoroso do eu-lírico feminino, com um tom de crítica social e nacionalismo. A obra é notável por transcender o sentimentalismo da época ao abordar temas de oposição à escravidão e à opressão patriarcal, utilizando a poesia como uma forma de denúncia sutil e, ao mesmo tempo, de exaltação patriótica e homenagem.</p><p>Essa edição comentada traz análises inéditas, notas explicativas e contexto histórico, revelando toda a força de sua voz pioneira.</p>', '49888_Cantos-a-beira-mar.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/42911_CANTOS-A-BEIRA-MAR-MIOLO-21-7-2025.pdf', 2, '4.5', 35, 1),
(10, '7', '52', 7, 0, 'O Seminarista', '<p>O Seminarista (1872), de Bernardo Guimarães, é um romance romântico que serve como um “romance de tese” para criticar o celibato clerical forçado e a operação religiosa da época. A trama gira em torno de Eugênio, um jovem obrigado pelos pais fazendeiros a seguir a vida eclesiástica, apesar de seu amor sincero e recíproco por Margarida. O seminário é retratado como um ambiente de repressão que sufoca os desejos naturais do protagonista. Após anos de separação, Eugênio descobre que Margarida não se casou e, em um reencontro passional, os dois consomem o amor proibido. A tragédia se consuma no clímax: no dia em que Eugênio se prepara para rezar sua primeira missa, o corpo de Margarida (que morre de tristeza e desgosto) é trazido à igreja.</p>', '58502_O-seminarista---Bernardo-Guimar&atilde;es.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/75537_O-Seminarista---Bernardo-Guimarães.pdf', 0, '0', 11, 1),
(11, '7', '52,56', 8, 1, 'S. Bernardo', '<p>São Bernardo (1934), de Graciliano Ramos, é um romance narrado em primeira pessoa por Paulo Honório, um fazendeiro rude e ambicioso que conta sua trajetória de miséria à riqueza. O livro se concentra na sua obsessão pela posse da fazenda São Bernardo e no seu trágico casamento com a professora Madalena.</p>', '74580_S.-Bernardo---Graciliano-Ramos.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/57813_S.-Bernardo---Graciliano-Ramos.pdf', 0, '0', 9, 1),
(12, '7', '24', 13, 1, 'A condessa V&eacute;sper', '<p>Publicado em 1882, A Condessa Vésper, de Aluísio Azevedo, marca a fase de transição do autor entre o Romantismo tardio e o Naturalismo, apresentando uma narrativa ousada e crítica à moralidade burguesa do século XIX. A protagonista, uma mulher enigmática e sedutora, simboliza a ruptura com o ideal feminino submisso, desafiando as convenções sociais por meio de sua inteligência e poder de influência. Considerada uma obra de passagem para o estilo naturalista que Azevedo consolidaria em O Mulato (1881) e O Cortiço (1890).<br /> </p><p><strong>Classificação indicativa:</strong> +14 anos.</p>', '94433_A-Condessa-de-Vésper-Aluísio-Azevedo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/60394_A-condessa-Vésper---Aluísio-Azevedo.pdf', 0, '0', 3, 1),
(13, '6', '69,70,26,27,28', 3, 1, 'Pan&oacute;plias', '<p>Panóplias, de Olavo Bilac, é uma coletânea de poemas que revela o virtuosismo formal e o lirismo característicos do parnasianismo, explorando temas como patriotismo, mitologia, amor idealizado e a própria arte poética. A obra reúne composições marcadas por rigor métrico, imagens refinadas e uma linguagem trabalhada, que exalta tanto a beleza clássica quanto o sentimento nacionalista, presente em variados poemas. Ao longo do livro, Bilac combina erudição e sensibilidade para criar verdadeiras “armaduras poéticas”, no qual a perfeição formal protege e enriquece emoções intensas e visões grandiosas da vida, da pátria e da arte.</p>', '65930_Pan&oacute;plias---Olavo-Bilac.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/39046_Panóplias---Olavo-Bilac.pdf', 0, '0', 7, 1),
(14, '6', '69,70,26,29,28', 3, 1, 'Alma Inquieta', '<p>Alma Inquieta, de Olavo Bilac, é um livro de poemas que revela a face mais sensível e introspectiva do autor, marcada por inquietações afetivas, existenciais e espirituais. Nesta obra, Bilac se afasta um pouco da rigidez parnasiana para explorar temas como o desejo, a fragilidade humana, a angústia do tempo e a busca por plenitude, tudo permeado por imagens delicadas e profunda musicalidade. Os poemas expressam um sujeito lírico dilacerado entre o ideal e a realidade, evidenciando uma alma em constante movimento, dividida entre o anseio pela perfeição e a consciência das limitações da vida.</p>', '33504_Alma-Inquieta---Olavo-Bilac.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/25848_Alma-Inquieta---Olavo-Bilac.pdf', 0, '0', 1, 1),
(15, '6', '69,70,26,29,28', 3, 1, 'Via-L&aacute;ctea', '<p>Via-Láctea, de Olavo Bilac, é uma coletânea de sonetos amorosos que expressa um lirismo delicado e intenso, marcada pela musicalidade e pela idealização da figura amada. </p>', '58226_Via-L&aacute;ctea---Olavo-Bilac.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/40_Via-Láctea---Olavo-Bilac.pdf', 0, '0', 23, 1),
(16, '6', '69,70,26,29', 3, 1, 'Tarde', '<p>Tarde, de Olavo Bilac, é um livro que reúne poemas marcados pela maturidade emocional e estética do autor, nos quais predominam o tom melancólico, a contemplação da passagem do tempo e a nostalgia da juventude perdida. A obra combina rigor formal parnasiano com uma sensibilidade mais suave e introspectiva, revelando um eu lírico que observa a vida com serenidade, mas também com a dor discreta de quem reconhece a finitude.</p>', '78924_Tarde---Olavo-Bilac.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/41621_Tarde---Olavo-Bilac.pdf', 0, '0', 16, 1),
(17, '6', '31,69,70,32', 3, 1, 'O ca&ccedil;ador de Esmeraldas', '<p>O Caçador de Esmeraldas, de Olavo Bilac, é um poema narrativo que recria de forma épica a vida e as jornadas do bandeirante Fernão Dias Paes Leme em sua busca obsessiva por esmeraldas nos sertões do Brasil colonial. Com linguagem refinada, ritmo marcado e imaginação vívida, Bilac transforma a aventura histórica em uma saga heroica, ressaltando o espírito desbravador, a dureza das expedições e o fascínio pelo desconhecido.</p>', '12438_O-ca&ccedil;ador-de-Esmeraldas---Olavo-Bilac.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/68424_O-caçador-de-Esmeraldas---Olavo-Bilac.pdf', 0, '0', 4, 1),
(18, '6', '33,69,70,29', 3, 1, 'As Viagens', '<p>As Viagens, de Olavo Bilac, é uma coletânea de poemas que transforma deslocamentos reais e imaginários em metáforas de descoberta e reflexão. Com rigor formal e lirismo, o autor percorre paisagens variadas enquanto explora emoções, memórias e a busca constante por sentido e beleza.</p>', '85423_As-Viagens---Olavo-Bilac.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/2510_As-Viagens---Olavo-Bilac.pdf', 0, '0', 9, 1),
(19, '6', '34,69,70,26', 3, 1, 'Profiss&atilde;o de F&eacute;', '<p>Profissão de Fé, de Olavo Bilac, reúne poemas em que o autor declara sua crença na arte rigorosa e na busca pela beleza perfeita, defendendo a poesia como ofício disciplinado e quase sagrado, marcado pela lapidação cuidadosa da linguagem.</p>', '42326_Profiss&atilde;o-de-F&eacute;---Olavo-Bilac.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/54597_Profissão-de-Fé---Olavo-Bilac.pdf', 0, '0', 4, 1),
(20, '7', '35,69,70,36,37', 14, 1, 'Mem&oacute;rias de Martha', '<p>Memórias de Martha, de Júlia Lopes de Almeida, é uma narrativa em que a protagonista, Martha, revisita sua própria vida por meio de confissões íntimas e reflexões sobre os desafios enfrentados por uma mulher no final do século XIX. A obra aborda temas como autonomia feminina, afetos, escolhas pessoais e pressões sociais, revelando, com sensibilidade e crítica, o processo de amadurecimento e autodescoberta da personagem.</p>', '51994_Mem&oacute;rias-de-Martha-narrativa---Julia-Lopes-de-Almeida.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/22029_Memórias-de-Martha-narrativa---Julia-Lopes-de-Almeida.pdf', 0, '0', 3, 1),
(21, '7', '25,38,24', 5, 1, '&Uacute;rsula', '<p>Úrsula, de Maria Firmina dos Reis, é um romance abolicionista que narra a história de amor entre Úrsula e Tancredo enquanto expõe, de forma sensível e crítica, a violência da escravidão no Brasil do século XIX. A obra destaca a perspectiva humana dos personagens negros, dando voz às suas dores, memórias e resistências, e marca-se como um dos primeiros romances escritos por uma mulher negra na literatura brasileira.</p>', '58925_&Uacute;rsula---Maria-Firmina-do-Reis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/13854_Úrsula---Maria-Firmina-do-Reis.pdf', 0, '0', 1, 1),
(22, '7', '25,39,36', 5, 1, 'A escrava', '<p>A Escrava, de Maria Firmina dos Reis, é um conto em que a autora denuncia a crueldade da escravidão por meio da história de uma mulher escravizada que relata suas dores, perdas e humilhações. Em tom profundamente humano e crítico, o texto expõe a violência física e emocional imposta aos negros e reafirma a sensibilidade abolicionista de Firmina, destacando a força moral e a dignidade da personagem diante da opressão.</p>', '42373_A-escrava---Maria-Firmina-dos-Reis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/24993_A-escrava---Maria-Firmina-dos-Reis.pdf', 0, '0', 6, 1),
(23, '7', '40,41,37', 13, 1, 'Aos Vinte Anos', '<p>Aos Vinte Anos, de Aluísio Azevedo, é uma narrativa que acompanha as inquietações, descobertas e conflitos emocionais de um jovem em seu início de vida adulta. Com estilo direto e observador, Azevedo retrata sonhos, ilusões, desejos e frustrações típicos dessa fase, compondo um retrato sensível do amadurecimento e das expectativas diante do futuro.</p>', '78825_Aos-Vinte-anos---Alu&iacute;sio-Azevedo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/70786_Aos-Vinte-anos---Aluísio-Azevedo.pdf', 0, '0', 2, 1),
(24, '7', '43,42', 8, 0, 'Vidas Secas', '<p>Vidas Secas, de Graciliano Ramos, é um romance que retrata a vida de uma família de retirantes que luta para sobreviver à seca e à miséria no sertão nordestino. Com linguagem concisa e dura, a obra expõe a precariedade, a fome e a violência estrutural que moldam o cotidiano dos personagens, revelando sua humanidade mesmo em meio ao silêncio, ao sofrimento e à luta constante por dignidade.</p>', '40951_Vidas-Secas---Graciliano-Ramos.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/68408_Vidas-Secas---Graciliano-Ramos.pdf', 0, '0', 9, 1),
(25, '6', '25,45,27', 15, 1, 'A Cachoeira de Paulo Afonso', '<p>A Cachoeira de Paulo Afonso, de Castro Alves, é um poema narrativo e descritivo que transforma a famosa queda d’água baiana em cenário grandioso para refletir sobre natureza, liberdade e força vital. Com imagens vigorosas e linguagem intensa, Castro Alves descreve o movimento poderoso da água e cria uma atmosfera épica, na qual a paisagem se torna símbolo de energia, beleza e imponência, típica de sua poesia romântica e engajada.</p>', '86507_A-Cachoeira-de-Paulo-Afonso---Castro-Alves.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/27231_A-Cachoeira-de-Paulo-Afonso---Castro-Alves.pdf', 0, '0', 9, 1),
(26, '7', '48,46,47', 18, 1, 'A casadinha de fresco', '<p>A Casadinha de Fresco, de Artur Azevedo, é uma comédia curta que satiriza os costumes da sociedade carioca do final do século XIX, especialmente o casamento por conveniência e as aparências sociais. Com humor leve e crítica afiada, a peça explora mal-entendidos, expectativas e vaidades dos personagens, revelando, por meio de diálogos ágeis, a ironia e o espírito observador característicos do autor.</p>', '73049_Ok-a-caladinha-de-fresco.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/26550_A-casadinha-de-fresco---Artur-Azevedo.pdf', 0, '0', 3, 1),
(27, '7', '48,46,47', 18, 1, 'A Princesa dos Cajueiros', '<p>A Princesa dos Cajueiros, de Artur Azevedo, é uma peça humorística que combina fantasia e sátira social ao narrar a história de uma jovem envolvida em situações cômicas e improváveis em meio a um ambiente nordestino marcado por costumes locais. Com diálogos ágeis e crítica leve aos valores e comportamentos da época, Azevedo constrói uma narrativa divertida que evidencia seu talento para o humor e para a observação das relações sociais.</p>', '75573_Ok-a-princesa-dos-cajueiros.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/6920_A-Princesa-dos-Cajueiros---Artur-Azevedo.pdf', 0, '0', 2, 1),
(28, '7', '48,47', 18, 1, 'A pele do lobo', '<p>A Pele do Lobo, de Artur Azevedo, é uma comédia de costumes que aborda, com humor irônico, as aparências sociais e a tendência humana de manipular a própria imagem para obter vantagens. A peça apresenta personagens envolvidos em enganos e disfarces, revelando, por meio de situações cômicas e críticas sutis, a hipocrisia e as vaidades presentes na sociedade brasileira do final do século XIX.</p>', '66733_Ok-A-pele-do-lobo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/18727_A-pele-do-lobo---Artur-Azevedo.pdf', 1, '4', 98, 1),
(29, '7', '47', 18, 1, 'O Asa-Negra', '<p>O Asa-Negra, de Artur Azevedo, é uma comédia que explora, com leveza e ironia, os mal-entendidos e mistérios envolvendo um personagem enigmático conhecido por esse apelido. A trama combina humor, crítica social e situações inesperadas típicas do teatro de Azevedo, revelando as manias, exageros e ilusões da sociedade urbana do final do século XIX.</p>', '82235_Ok-asa-negra.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/52322_O-ASA-NEGRA---Artur-Azevedo.pdf', 0, '0', 2, 1),
(30, '7', '47', 18, 1, 'Entre a Missa e o Almoço', '<p>Entre a Missa e o Almoço, de Artur Azevedo, é uma comédia breve que retrata, com humor e crítica de costumes, os encontros e desencontros sociais que acontecem no intervalo entre dois rituais tradicionais da sociedade carioca do século XIX: a missa e o almoço familiar. A peça evidencia vaidades, fofocas e pequenos conflitos típicos da vida urbana, sempre com o olhar irônico e espirituoso característico do autor.</p>', '30301_Entre-a-missa-e-o-almoço.jpg\n', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/47390_Entre-a-Missa-e-o-Almoço---Artur-Azevedo.pdf', 0, '0', 6, 1),
(31, '7', '', 19, 1, 'Laranja-da-China', '<p>Laranja-da-China, de Antônio de Alcântara Machado, é um conto que retrata, com humor e crítica social, a convivência entre imigrantes e brasileiros na São Paulo do início do século XX. A narrativa mostra diferenças culturais, conflitos sutis e situações cotidianas marcadas por choque de costumes, usando linguagem dinâmica e coloquial para evidenciar a modernização da cidade e as tensões entre tradição e mudança.</p>', '60989_Laranja-da-China---Ant&ocirc;nio-de-Alc&acirc;ntara-Machado.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/42799_Laranja-da-China---Antônio-de-Alcântara-Machado.pdf', 0, '0', 2, 1),
(32, '7', '24', 17, 0, 'Senhora', '<p>Senhora, de José de Alencar, é um romance que acompanha a história de Aurélia Camargo, jovem que, após herdar uma grande fortuna, decide retomar o controle do próprio destino ao “comprar” o casamento com Fernando Seixas, o homem que antes a rejeitara por interesse. A obra explora temas como orgulho, amor, poder e crítica às relações sociais do século XIX, mostrando a transformação dos sentimentos do casal e o embate entre dinheiro e afeto, em uma trama marcada por elegância, ironia e forte dimensão psicológica.</p>', '8322_Senhora---Jos&eacute;-de-Alencar.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/15050_Senhora---José-de-Alencar.pdf', 0, '0', 2, 1),
(34, '10', NULL, 15, 1, 'Coletânea de Castro Alves', '<p>A <em>Coletânea de Castro Alves</em> reúne poemas que expressam a força lírica, social e imagética do poeta, combinando temas amorosos, paisagens naturais, memórias pessoais e, sobretudo, a denúncia vibrante da escravidão. Entre versos de exaltação à liberdade, cenas grandiosas da natureza brasileira e confissões íntimas de amor e saudade, a obra revela o estilo intenso e emotivo de Castro Alves, marcado por musicalidade elevada, imaginação expansiva e forte compromisso humanitário.</p>', '28424_Coletânea-Castro-Alves-.jpg\n', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/2509_Coletânea---Castro-Alves.pdf', 0, '0', 1, 1),
(35, '7', '49', 18, 1, 'Contos fora de moda', '<p>Contos fora de moda, de Artur Azevedo, reúne narrativas breves que retratam com ironia e leveza o cotidiano urbano do final do século XIX, especialmente o Rio de Janeiro. Com olhar crítico e humor refinado, o autor aborda costumes, relações sociais, hipocrisias da vida burguesa e pequenas contradições humanas, construindo personagens verossímeis e situações aparentemente simples, mas carregadas de crítica social. A obra evidencia o talento de Artur Azevedo para observar a sociedade de seu tempo e transformá-la em prosa ágil, satírica e atual, apesar do título sugerir o contrário.</p>', '55179_Contos-fora-de-moda-jpg.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/58888_Contos-Fora-da-Moda---Artur-Azevedo.pdf', 1, '5', 205, 1),
(36, '7', '48,46,51', 18, 1, 'A Capital Federal', '<p>A Capital Federal, de Artur Azevedo, é uma comédia teatral que satiriza a sociedade carioca do fim do século XIX, expondo o contraste entre a ingenuidade provinciana e os costumes da vida urbana no Rio de Janeiro. .</p>', '15027_Ok-a-capital-federal.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/90294_A-Capital-Federal---Artur-Azevedo.pdf', 0, '0', 0, 1),
(37, '7', '', 8, 0, 'Ang&uacute;stia', '<p>Angústia, de Graciliano Ramos, é um romance psicológico que acompanha o fluxo de consciência de Luís da Silva, funcionário público atormentado por frustrações pessoais, ressentimentos sociais e obsessões amorosas.</p>', '14525_Ang&uacute;stia---Graciliano-Ramos.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/44554_Angústia---Graciliano-Ramos.pdf', 0, '0', 2, 1),
(38, '7', NULL, 18, 1, 'A Joia', '<p>A Joia, de Artur Azevedo, é um conto que explora, com ironia e crítica social, o valor das aparências e o poder simbólico do dinheiro nas relações humanas, revelando como a ambição e a vaidade podem conduzir a equívocos e frustrações.</p>', '43930_A-joia.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/85903_A-Joia---Artur-Azevedo.pdf', 0, '0', 1, 1),
(39, '7', NULL, 18, 1, 'A Moça mais Bonita do Rio de Janeiro', '<p><em>A Moça Mais Bonita do Rio</em>, de Artur Azevedo, retrata com humor refinado e olhar satírico o culto à beleza e à reputação na sociedade carioca, expondo a superficialidade dos julgamentos sociais e as ilusões criadas em torno da fama e do prestígio feminino no ambiente urbano do final do século XIX.</p>', '22521_A-moça-mais-bonita-do-rio.jpg\n', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/58963_A-Moça-mais-Bonita-do-Rio-de-Janeiro---Artur-Azevedo.pdf', 0, '0', 2, 1),
(40, '7', '', 5, 1, 'Gupeva', '<p>Gupeva, de Maria Firmina dos Reis, é um romance indianista que narra uma história de amor marcada por tragédia, honra e choque cultural, ambientada no contexto colonial brasileiro.</p>', '35205_Guapeva-_.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/44949_Gupeva---Maria-Firmina-dos-Reis.pdf', 0, '0', 6, 1),
(41, '7', NULL, 18, 1, 'A Filha de Maria Angu', '<p>A Filha de Maria Angu, de Artur Azevedo, é um conto que retrata, com humor mordaz e observação social apurada, o cotidiano das camadas populares do Rio de Janeiro.</p>', '78520_A-filha-de-Maria-angu.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/28044_A-Filha-de-Maria-Angu---Artur-Azevedo.pdf', 0, '0', 1, 1),
(42, '10', NULL, 20, 1, 'Coletânea de Adelina Lopes Vieira', '<p>A <em>Coletânea</em>, de Adelina Lopes Vieira, reúne poemas narrativos de cunho moral e educativo, centrados no universo infantil e familiar. Por meio de cenas do cotidiano, a autora aborda temas como obediência, responsabilidade, afeto, consequências dos atos e formação do caráter. Os textos combinam lirismo, simplicidade vocabular e intenção pedagógica, frequentemente encerrando uma lição explícita ou implícita, característica da literatura voltada à educação moral das criança.</p>', '12966_Adelina-Lopes.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/21430_Coletânea----Adelina-Lopes-Vieira.pdf', 0, '0', 3, 1),
(43, '7', '52,69,70', 21, 0, 'Quincas Borba', '<p>Publicado em 1891, Quincas Borba, de Machado de Assis, é um dos principais romances do Realismo brasileiro e narra a decadência física e mental de Rubião, homem ingênuo do interior de Minas Gerais que herda a fortuna do excêntrico filósofo Quincas Borba, junto com a missão de divulgar o Humanitismo, filosofia satírica resumida na máxima “Ao vencedor, as batatas”. Ao mudar-se para o Rio de Janeiro, Rubião tenta integrar-se à elite urbana, mas acaba sendo manipulado por Cristiano Palha e sua esposa Sofia, por quem se apaixona, tornando-se vítima da ambição, do egoísmo e das aparências sociais. Progressivamente explorado, isolado e emocionalmente destruído, o protagonista enlouquece e morre na miséria, enquanto o romance, conduzido por um narrador irônico e crítico, expõe com profundidade psicológica a hipocrisia social, o falso progresso e o uso desumanizado da razão, marcas centrais do estilo machadiano.</p>', '71322_Quincas-Borba---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/47620_Quincas-Borba---Machado-de-Assis.pdf', 0, '0', 3, 1),
(44, '7', NULL, 22, 1, 'Lucrécias', '<p>Lucrécias, de Bruno Seabra, é uma obra que reúne poemas marcados por forte intensidade emocional e olhar crítico sobre a experiência humana, especialmente as tensões entre desejo, culpa, memória e identidade feminina. Com linguagem sensível e imagética, o autor constrói vozes líricas que dialogam com a tradição clássica e contemporânea, explorando conflitos íntimos e sociais, ao mesmo tempo em que questiona padrões morais e afetivos, resultando em uma poesia densa, reflexiva e provocadora.</p>', '10915_Lucrécias---Bruno-Seabra.jpg\n', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/16312_Lucrécias---Bruno-Seabra.pdf', 0, '0', 14, 1),
(45, '7', NULL, 19, 1, 'Mana Maria', '<p>Mana Maria, de Antônio de Alcântara Machado, é um conto que retrata com ironia e aguda observação social os costumes da pequena burguesia paulistana do início do século XX. A narrativa apresenta a personagem-título como símbolo de valores tradicionais, religiosidade e moral rígida, contrastando com as transformações sociais e comportamentais da vida urbana.</p>', '82991_Mana-Maria---Antônio--de-Alcântara-Machado.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/77509_Mana-Maria---Antônio--de-Alcântara-Machado.pdf', 0, '0', 2, 1),
(46, '7', '47', 23, 1, 'Hamlet', '<p>Hamlet, escrita por William Shakespeare no início do século XVII (por volta de 1599-1601), é uma das mais célebres tragédias da literatura mundial e uma das obras centrais do teatro inglês. A peça narra a história do príncipe Hamlet da Dinamarca, que enfrenta o dilema de vingar a morte de seu pai, assassinado por seu tio Cláudio, que usurpou o trono e se casou com a mãe de Hamlet, Gertrudes.</p>', '43316_Hamlet---William-Shakespeare.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/73373_Hamlet,-Príncipe-da-Dinamarca---William-Shakeaspeare.pdf', 1, '5', 10, 1),
(47, '7', '49', 19, 1, 'Brás, Bexiga e Barra Funda', '<p>Brás, Bexiga e Barra Funda, de Antônio de Alcântara Machado, é uma coletânea de contos que retrata o cotidiano dos bairros operários de São Paulo no início do século XX, marcados pela presença de imigrantes, especialmente italianos.</p>', '52403_Brás,-Bexiga-e-Barra-Funda---Antônio-de-Alcântara-Machado.jpg\n', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/90334_Brás,-Bexiga-e-Barra-Funda---Antônio-de-Alcântara-Machado.pdf', 0, '0', 6, 1),
(48, '7', '69,70,29', 3, 1, 'Sar&ccedil;as de Fogo', '<p>Sarças de Fogo, de Olavo Bilac, é uma coletânea de poemas que expressa o lirismo intenso e a musicalidade característica do autor parnasiano, abordando temas como amor, sofrimento, desejo, espiritualidade e conflito interior. A obra combina rigor formal, imagens ardentes e tom confessional, revelando a tensão entre paixão e razão, fé e angústia, e evidenciando a busca de Bilac pela perfeição estética aliada à intensidade emocional.</p>', '67490_Sar&ccedil;as-de-Fogo---Olavo-Bilac.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/68698_Sarças-de-Fogo---Olavo-Bilac.pdf', 0, '0', 1, 1),
(49, '7', '49', 24, 1, 'Assombramento: Hist&oacute;ria do Sert&atilde;o', '<p>No conto “Assombramento”, de Afonso Arinos, um tropeiro desafia a fama de uma casa mal-assombrada e decide passar a noite sozinho no local. Tomado pelo medo e por alucinações provocadas pela solidão e pela atmosfera do sertão, acaba sofrendo um acidente fatal, reforçando, para os demais, a crença no sobrenatural.</p>', '39645_Assombramento---Afonso-Arinos.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/64467_Assombramento---Afonso-Arinos.pdf', 0, '0', 3, 1),
(50, '7', '', 13, 1, 'A mortalha de Alzira', '<p>A Mortalha de Alzira, de Aluísio Azevedo, é um conto de atmosfera sombria que aborda o amor obsessivo e a loucura, explorando os limites entre realidade e imaginação. A narrativa acompanha um narrador dominado pela lembrança de Alzira, cuja morte desencadeia delírios e visões, revelando a degradação psicológica do protagonista e refletindo características do Naturalismo, como o determinismo e o desequilíbrio mental.</p>', '69295_A-mortalha-de-Alzira---Alu&iacute;sio-Azevedo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/15246_A-mortalha-de-Alzira---Aluísio-Azevedo.pdf', 0, '0', 4, 1),
(51, '7', '24,41', 17, 1, 'Til', '<p>Til, de José de Alencar, é um romance regionalista que retrata a vida rural paulista do século XIX, tendo como protagonista Berta, jovem conhecida como Til, que atua como mediadora moral entre conflitos familiares e sociais. A obra combina lirismo, descrição da natureza e crítica às desigualdades, integrando o projeto romântico de construção da identidade nacional.</p>', '75195_Til---Jos&eacute;-de-Alencar.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/3560_Til---José-de-Alencar-.pdf', 0, '0', 1, 1),
(52, '7', '50,24,37', 13, 1, 'Casa de Pens&atilde;o', '<p>A Casa de Pensão é uma obra de ficção naturalista que ilustra a decadência moral e social de Amâncio, um jovem do interior que se transfere para o Rio de Janeiro para estudar, e se vê imerso em intrigas, seduções e interesses financeiros em uma pensão. A história revela a falsidade da sociedade urbana, o fatalismo social e o impacto do ambiente no ser humano, resultando em tragédia.</p>', '3327_Casa-de-Pens&atilde;o---Alu&iacute;sio-Azevedo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/14978_Casa-de-Pensão---Aluísio-Azevedo.pdf', 0, '0', 5, 1),
(53, '7', '24,37', 17, 1, 'Cinco Minutos', '<p>Cinco Minutos é uma obra literária urbana de inspiração romântica que conta a história de um jovem que, após perder um ônibus por apenas cinco minutos, vê sua vida mudar ao encontrar a enigmática Carlota. A partir deste encontro acidental, surge uma história caracterizada pela idealização do amor, sentimentalismo e aventuras típicas do Romantismo. Situada no Rio de Janeiro do século XIX, a obra destaca o amor como um poder libertador e destaca a leveza e o encanto do escritor em sua fase urbana.</p>', '6513_Cinco-Minutos---Jos&eacute;-de-Alencar.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/80329__Cinco-Minutos---José-de-Alencar.pdf', 0, '0', 1, 1),
(54, '9', '50,69,70,46,51', 21, 1, 'A semana (1892)', '<p>As crônicas semanais de Machado de Assis em 1892 oferecem um panorama satírico da vida brasileira pós-República, focando na instabilidade política e no caos financeiro. O autor ironiza a especulação desenfreada de sociedades anônimas e debêntures, o baixo comparecimento eleitoral atribuído à “inércia” do cidadão, e a ineficiência do Congresso, que se arrasta entre debates sobre federalismo e parlamentarismo. A sátira estende-se a costumes sociais, como a hipocrisia das quermesses disfarçadas de caridade e o tédio generalizado da sociedade, que busca alívio em escândalos macabros ou na chegada da companhia lírica.</p>', '65882_A-semana-(1892)---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/55102_A-semana-(1892)---Machado-de-Assis.pdf', 0, '0', 0, 1),
(55, '9', '69,70,46,37,51', 21, 1, 'A semana (1893)', '<p>A crônica de Machado de Assis, abrangendo de janeiro a julho de 1893, oferece um panorama satírico e filosófico da vida política e social do Rio de Janeiro, misturando fatos e invenções. O autor ironiza a esfera pública com a observação de um novo “crime” (a renúncia a um mandato), o tumulto financeiro causado pela fusão de bancos e o pânico gerado por cheques e notas falsas, além da ineficácia das posturas municipais, como o despejo dos vendedores de rua e a demolição do cortiço Cabeça de Porco. </p>', '34651_A-semana-(1893)---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/62742_A-semana-(1893)---Machado-de-Assis.pdf', 0, '0', 0, 1),
(56, '9', '69,70,43,51', 21, 1, 'A semana (1895)', '<p>O trecho de “A semana (1895)” de Machado de Assis apresenta uma série de crônicas que exploram, com tom ora irônico ora filosófico, a política, os costumes e os acontecimentos da época no Rio de Janeiro e no mundo. O cronista aborda a instabilidade política, discutindo desde a renúncia do presidente francês e o crescente poder japonês, até a crise do câmbio, propostas de reformas constitucionais (como a hereditariedade de mandatos e a substituição do voto por sorteio), e as fraudes eleitorais na Bahia (“emprenhar a urna”).</p>', '23274_A-semana-(1895)---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/60891_A-semana-(1895)---Machado-de-Assis.pdf', 0, '0', 1, 1),
(57, '9', '69,70,46,51', 21, 1, 'A semana (1894)', '<p>Este excerto de “A semana (1894)”, de Machado de Assis, apresenta uma série de crônicas semanais que cobrem o período de 1º de janeiro a 1º de julho. Nelas, o autor reflete com ironia e humor sobre o cotidiano carioca e a natureza humana, abordando temas variados como o intenso calor do verão e o consequente aumento nos obituários, a proibição das folias de carnaval, as mudanças políticas como a transferência provisória da capital do Estado para Petrópolis, e a ineficácia das leis e das discussões do Conselho Municipal.</p>', '29450_A-semana-(1894)---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/2491_A-semana-(1894)---Machado-de-Assis.pdf', 0, '0', 1, 1),
(58, '9', '50,69,70,46,51', 21, 1, 'A semana (1896)', '<p>As crônicas de Machado de Assis em A semana (1896) apresentam um panorama da vida brasileira, mesclando reflexões sociais, políticas e culturais com ironia e melancolia. O autor aborda a vida na capital, detalhando a substituição do jogo dos bichos por divertimentos lícitos no Jardim Zoológico, a popularidade do kneippismo (cura pela água fria) como medicina barata, e o desapontamento com a declaração do Dr. Abel Parente de que só existem três remédios específicos.</p>', '38565_A-semana-(1896)---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/52337_A-semana-(1896)---Machado-de-Assis.pdf', 0, '0', 40, 1),
(59, '9', '50,69,70,46,51', 21, 1, 'A semana (1897)', '<p>“A Semana” (1897), de Machado de Assis, é uma coleção de crônicas que oferece uma visão satírica e reflexiva sobre os acontecimentos sociais, políticos e culturais no Brasil e no exterior, entre janeiro e fevereiro de 1897.<br /> </p>', '90581_A-semana-(1897)---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/79598_A-semana-(1897)---Machado-de-Assis.pdf', 0, '0', 0, 1),
(60, '9', '50,69,70,51', 21, 1, 'A semana (1900)', '<p>As crônicas de <em>A semana</em> de Machado de Assis refletem sobre a vida cotidiana e eventos notáveis, priorizando o comentário humanista sobre o fato seco. Na primeira crônica, de “4 de novembro”, o autor se comove mais com a morte de João, o sineiro octogenário da Glória, um ex-escravo que serviu fielmente a igreja por 45 anos, do que com a queda do Banco Rural ou o terremoto na Venezuela, usando a longevidade e a dedicação do sineiro como contraponto à fugacidade das instituições financeiras e à fatalidade ingrata dos desastres naturais. Já em “11 de novembro”, o cronista dedica-se a observar o “mínimo e o escondido” em um leilão de objetos empenhados, notando itens comuns e um livro de missa, mas fixando sua atenção em uma espada. A presença da espada no prego inspira reflexões sobre a desonra e a necessidade, levando o autor a especular de forma irônica que o dono poderia ser um imigrante grego, o mais pobre de todos, ou, mais provavelmente, um contra-regra de teatro que a empenhou para poder almoçar.</p>', '57588_A-semana-(1900)---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/99190_A-semana-(1900)---Machado-de-Assis.pdf', 0, '0', 0, 1),
(61, '9', '69,70,46,37', 21, 1, 'Aquarelas', '<p>Aquarelas, uma sátira social de Machado de Assis, é apresentada em quatro esboços que empregam a metáfora da pintura para retratar as formas grosseiras de personagens típicos do período. O primeiro tipo é o Fanqueiro Literário, um negociante que transforma o talento em “fancaria literária” (obra grosseira) e mede o entusiasmo do elogio pelas “consequências pecuniárias” do elogiado, o que é visto como uma “aberração dos tempos modernos”. Em seguida, o autor apresenta o Parasita, comparado à erva que se enrosca em árvores, que se manifesta em diversas esferas, como o da mesa (o mais vulgar e gastrônomo) e o literário (uma “nulidade” que invade a imprensa e o teatro para se promover, apesar de não ter a “mira no resultado pecuniário”). O terceiro tipo é o **Empregado Público Aposentado**, a “múmia do passado” e “elegia viva do que foi,” que representa o lado cômico das forças retroativas, rejeita qualquer progresso (como as estradas de ferro) e utiliza sua amizade com ministros para conseguir empregos. Por fim,O Folhetinista, uma “espécie europeia” (francesa) com dificuldades de adaptação no Brasil, é uma “combinação admirável do útil e do fútil”. No entanto, é criticado por ser “totalmente parisiense” e não adotar “uma tonalidade local, um estilo americano”, o que resulta em um “suicídio de originalidade e iniciativa”.</p>', '54552_Aquarelas---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/73426_Aquarelas---Machado-de-Assis.pdf', 0, '0', 1, 1),
(62, '6', '52,27', 5, 0, 'Cantos &agrave; beira-mar (Edi&ccedil;&atilde;o Comentada pela Profa. Luciana Ayres)', '<p>Cantos à beira-mar (1871) é a única coletânea poética de Maria Firmina dos Reis, destacando-se no Romantismo brasileiro por mesclar um profundo lirismo subjetivo, onde o mar e a natureza servem de palco para a melancolia, solidão e idealismo amoroso do eu-lírico feminino, com um tom de crítica social e nacionalismo. A obra é notável por transcender o sentimentalismo da época ao abordar temas de oposição à escravidão e à opressão patriarcal, usando a poesia como uma forma de denúncia sutil e, ao mesmo tempo, de exaltação patriótica e homenagem.</p><p>Esta edição conta com comentários da professora Luciana Ayres, que analisam os poemas e ajudam a compreender melhor o contexto histórico, literário e social em que foram escritos, ampliando a leitura da poesia firminiana para o público contemporâneo.</p>', '1048_Cantos-a-beira-mar.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/39244_Contos-a-beira-mar---Alma,-Dor-e-Liberdade-A-Mulher-e-o-Mundo.pdf', 0, '0', 25, 1),
(63, '10', '69,70,27,24', 21, 1, 'Cris&aacute;lidas', '<p>Crisálidas, o livro de estreia poética de Machado de Assis (1864), é uma coleção de poemas de forte influência romântica que exploram o “duelo infausto entre a aspiração e a realidade”, a melancolia e a perda das ilusões. A obra aborda o amor — seja ele idealizado e redentor, como na série de versos dedicados a Corina, seja perdido e marcado pela tristeza, como nos poemas a Lúcia e Maria Duplessis — e a busca por refúgio na arte e na fé, frente às dores do mundo (como em “Musa Consolatrix” e “Fé”). Além dos temas líricos, a coletânea inclui poemas de crítica social e política, como a sátira “Os Arlequins” e as composições que lamentam a opressão de nações como Polônia e México, e reflexões filosóficas sobre a dualidade da vida entre a saudade do passado e a esperança do futuro (“Os Dous Horizontes”).</p>', '62700_Cris&aacute;lidas---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/93835_Crisálidas---Machado-de-Assis.pdf', 0, '0', 1, 1),
(64, '7', '52,69,70,24', 21, 1, 'Esa&uacute; e Jac&oacute;', '<p>O romance Esaú e Jacó de Machado de Assis inicia-se com a visita da Baronesa Natividade e sua irmã Perpétua à cabocla do Morro do Castelo, em 1871, para consultar o futuro de seus filhos gêmeos, Pedro e Paulo. A adivinha lhes promete “coisas futuras” de glória, mas revela que os meninos “brigaram no ventre de sua mãe”. Perturbado, o pai, Santos, consulta um espírita que confirma a briga, associando a rivalidade a um prenúncio e aos nomes dos apóstolos Pedro e Paulo. Ao longo dos anos, a predição da discórdia se manifesta: os gêmeos, idênticos na aparência, desenvolvem personalidades e opiniões políticas opostas, Pedro defende a Monarquia e Paulo a República (chegando a brigar por retratos de Luís XVI e Robespierre). A mãe enfrenta um conflito que se intensifica, tornando-se ainda mais complicado com a chegada de Flora, uma jovem discreta e elegante que desperta o interesse de ambos os irmãos, criando o cenário para uma disputa mais acirrada.</p>', '16736_Esa&uacute;-e-Jac&oacute;---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/33567_Esaú-e-Jacó---Machado-de-Assis.pdf', 0, '0', 1, 1),
(65, '9', '69,70,46,41', 21, 1, 'Balas de Estalo', '<p>“Balas de Estalo” é uma série de crônicas escritas por Machado de Assis e publicadas originalmente na Gazeta de Notícias entre 1883 e 1886, que oferece um olhar crítico, irônico e perspicaz sobre os costumes, a política e as peculiaridades da sociedade brasileira da época. A obra utiliza a sátira para abordar a ineficácia e a incoerência da vida política (como a discussão sobre subsídios e a facilidade em copiar modelos estrangeiros) e as manias sociais, ridicularizando modismos como a dosimetria e a “comissiomania”. O autor também critica a política de imigração e trabalho por meio da crônica que, ironicamente, sugere o uso de chimpanzés no lugar de trabalhadores asiáticos por serem mais “econômicos” e “moralmente superiores”. Por fim, as crônicas denunciam o abuso de autoridade e a limitação das liberdades, exemplificado pelo recolhimento policial de ossos de defunto expostos em vitrines, um ato que o narrador vê como perigoso para a liberdade de expressão.</p>', '83923_Balas-de-Estalo---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/25634_Balas-de-Estalo---Machado-de-Assis.pdf', 0, '0', 42, 1),
(66, '7', '48,69,70,47', 21, 1, 'As Forcas Caudinas', '<p>A comédia em dois atos de Machado de Assis, As Forcas Caudinas, se passa em Petrópolis e acompanha Tito, um solteiro que se gaba de sua completa indiferença ao amor, declarando preferir o jogo de voltarete a qualquer paixão, o que o torna um alvo para as damas. Emília Soares, uma viúva espirituosa cortejada pelo coronel russo Aleixo Cupidov, se ofende com a “injúria ao sexo” de Tito e planeja “castigá-lo” fazendo-o se apaixonar por ela. Entretanto, a indiferença inabalável de Tito faz com que Emília se apaixone genuína e perdidamente por ele, chegando a se humilhar ao se declarar e ser friamente dispensada. No clímax da peça, Tito revela que sua indiferença era um plano de vingança meticuloso: Emília era a mulher que o havia rejeitado anos antes, e ele forjou sua persona de misógino para reaparecer e forçá-la a desejá-lo, submetendo-a às “forcas caudinas” da humilhação para, só então, aceitar sua mão em casamento, declarando que nunca deixou de amá-la.<br /> </p>', '54615_As-Forcas-Caudinas---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/76919_As-Forcas-Caudinas---Machado-de-Assis.pdf', 0, '0', 0, 1),
(67, '7', '69,70', 21, 1, 'Pap&eacute;is Avulsos', '<p>O documento apresenta a obra *Papéis Avulsos* de Machado de Assis, uma coleção de escritos diversos que o autor descreve em sua advertência como “pessoas de uma só família”. A obra engloba contos e textos de diferentes gêneros, destacando-se as narrativas “O Alienista” (com a história do Dr. Simão Bacamarte e a Casa Verde), “Teoria do Medalhão” (apresentada em forma de diálogo), “A Chinela Turca” e “Na Arca” (três capítulos inéditos do Gênesis).</p>', '81241_Pap&eacute;is-Avulsos---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/45399_Papéis-Avulsos---Machado-de-Assis.pdf', 0, '0', 0, 1),
(68, '8', '69,70', 21, 1, 'Garrett', '<p>O ensaio de Machado de Assis sobre Almeida Garrett celebra-o como um dos principais gênios da língua portuguesa após Camões, alguém que por si só “valia uma literatura”. O autor destaca a vasta e diversa produção de Garrett, que foi poeta, prosador, romancista, dramaturgo, orador e humorista, deixando um primor em cada gênero, como atestam obras como Frei Luís de Sousa e Folhas Caídas. Garrett foi o responsável por trazer o Romantismo para Portugal, mas seu trabalho se destacou por ter um “cunho próprio e puramente nacional”, sendo o “homem da sua pátria e do seu século”. Apesar de Garrett ter tido uma atuação na política, inclusive como ministro, Machado de Assis reforça que o que se celebra no centenário de seu nascimento não é o político, mas sim o grande escritor, cujas páginas permanecem vivas por unirem “a alma da nação com a vida da humanidade”.</p>', '86653_Garrett---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/74171_Garrett---Machado-de-Assis.pdf', 0, '0', 0, 1),
(69, '7', '69,70,24', 21, 1, 'Helena', '<p>A história começa com a morte súbita do Conselheiro Vale e a abertura de seu testamento, que choca a família ao revelar que ele reconhecia Helena como sua filha natural, herdeira e que deveria ser tratada como legítima. Enquanto sua irmã, Dona Úrsula, a considera uma intrusa, o filho, Dr. Estácio, aceita a disposição com benevolência. Helena, uma jovem inteligente, afável e elegante, chega à casa em Andaraí e, após um período de observação mútua e dedicação, especialmente ao cuidar devotadamente de Dona Úrsula durante uma doença, consolida sua posição, tornando-se uma figura central e influente. A ascensão de Helena coincide com o relacionamento hesitante de Estácio com Eugênia, a filha superficial do Dr. Camargo, um amigo da família que desaprova a nova herdeira. Desejando garantir o casamento de sua filha com o rico Estácio antes de viajar, Camargo confronta Helena, revelando saber um segredo sobre ela (sua visita a uma casa com a “bandeira azul”), usando isso para chantageá-la e forçar sua intervenção. Pressionado pela promessa feita e pela interferência, Estácio formaliza o pedido de casamento a Eugênia, cumprindo assim a última vontade (e a de Camargo) e selando o destino da família.</p>', '80790_Helena---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/21456_Helena---Machado-de-Assis-(1).pdf', 0, '0', 3, 1),
(70, '7', '49,69,70,24', 21, 0, 'Contos Fluminenses', '<p>A coleção Contos Fluminenses de Machado de Assis explora a sociedade carioca do século XIX, focando nas tensões entre amor genuíno, ambição financeira e convenções sociais. A primeira novela, “Miss Dollar”, narra como o Dr. Mendonça, um excêntrico colecionador de cães, se apaixona pela viúva Margarida, que o rejeita por suspeitar que todos os homens, devido a uma desilusão passada, só cobiçam sua fortuna. A persistência de Mendonça e sua honradez, que o levam até um casamento de fachada para salvar a reputação dela, eventualmente provam seu amor, transformando a união formal em real. Em contraste, “Luís Soares” apresenta um dândi arruinado que tenta forçar um casamento com sua prima Adelaide para obter uma grande herança póstuma; contudo, Adelaide, consciente da ambição e falta de caráter dele, inflige-lhe uma humilhação profunda que o leva ao suicídio, destacando a severidade moral da época e o preço do orgulho.</p>', '50485_Contos-Fluminenses---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/67775_Contos-Fluminenses---Machado-de-Assis.pdf', 0, '0', 0, 1);
INSERT INTO `tbl_books` (`id`, `cat_id`, `section_ids`, `aid`, `featured`, `book_title`, `book_description`, `book_cover_img`, `book_file_type`, `book_file_url`, `total_rate`, `rate_avg`, `book_views`, `status`) VALUES
(71, '7', '52,69,70,24', 21, 1, 'Casa Velha', '<p>O cônego-narrador, ao buscar documentos na Casa Velha para escrever uma história sobre D. Pedro I, depara-se com o drama de D. Antônia, que se opõe ao amor entre seu filho, Félix, e a jovem agregada Lalau. Movida pelo orgulho social, D. Antônia inventa que Lalau é filha ilegítima de seu falecido marido, tornando-a meia-irmã de Félix e forçando a separação do casal. A mentira, no entanto, leva o cônego a uma descoberta dolorosa: Lalau não é a filha bastarda, mas o ministro de fato teve um caso extraconjugal no passado, destruindo a veneração de D. Antônia pelo marido. Arrependida e humilhada pela verdade, D. Antônia retira o impedimento e aprova o casamento; contudo, Lalau, profundamente envergonhada pela história de seu pai biológico (que não era o ministro) e o constrangimento social que sofreu, recusa-se a se casar com Félix, alegando que não pode se unir à família do homem que “envergonhou minha família”. Ao final, Lalau casa-se com o humilde Vitorino, filho do segeiro, e Félix se casa com a pretendente rica, Sinhazinha, encerrando o drama com a separação dos amantes.</p>', '72812_Casa-Velha---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/68183_Casa-Velha---Machado-de-Assis.pdf', 0, '0', 1, 1),
(72, '6', '69,70', 21, 1, 'Americanas', '<p>A coletânea poética Americanas, de Machado de Assis, explora em longos poemas narrativos temas como o conflito entre a cultura indígena e a colonização, o destino trágico dos povos nativos e a afirmação da identidade brasileira, tudo sob uma perspectiva lírica e melancólica. A obra articula diversas histórias de amor e sacrifício, destacando a saga de Potira, uma índia cristã capturada pelo guerreiro Tamoio Anajê, que escolhe a morte cruel para preservar sua fidelidade conjugal e religiosa; a dor de Niâni, que, após ser abandonada pelo esposo Guacuru, realiza um ato simbólico de renúncia; e a provação de Ângela, a \\\\\\\"Cristã-Nova,\\\\\\\" em meio à perseguição religiosa no Rio de Janeiro colonial. Além disso, o livro presta homenagem a grandes vultos nacionais, como José Bonifácio e Gonçalves Dias, e medita sobre a fatalidade da história e a natureza indomável da América.</p>', '77044_Americanas---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/15056_Americanas---Machado-de-Assis.pdf', 0, '0', 0, 1),
(73, '8', '69,70,43,47', 21, 1, 'Supl&iacute;cio de uma mulher', '<p>O texto apresenta dois folhetins de Machado de Assis sobre o drama em três atos *Suplício de uma mulher*, de Emile de Girardin e Alexandre Dumas Filho, focando na polêmica de autoria e na crítica moral da peça. A primeira parte detalha a disputa entre os autores: a versão inicial de Girardin foi considerada “perigosa, irrepresentável, impossível” pelo comitê do Teatro Francês, levando Alexandre Dumas Filho a reescrevê-la por completo, com a premissa de que a obra devia ser baseada em “interesse, de fatos, de ação, de movimento e de progressão”. Embora a nova versão de Dumas tenha alcançado imenso sucesso, Girardin a criticou em público como “detestável” e agiu de forma unilateral, vendendo o manuscrito como se fosse o único autor, o que motivou a contestação de Dumas Filho para provar a sua parte na obra. Já a “Crítica teatral” elogia o drama por sua forma “interessante, rápida, precisa” e por abordar a “terrível questão do adultério”, concluindo com uma “lição severa, tremenda, implacável” que defende a moralidade e a santidade das leis morais. A crítica ressalta que as simpatias do público ficam com o marido, Dumont, que no último ato assume a “inflexibilidade de juiz” e condena a esposa adúltera Matilde e seu amante Alvarez, resultando em uma “vitória da lei moral e da pureza dos costumes”.</p>', '6410_Supl&iacute;cio-de-uma-mulher---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/79203_Suplício-de-uma-mulher---Machado-de-Assis.pdf', 0, '0', 2, 1),
(74, '9', '50,69,70', 21, 1, 'Gazeta de Holanda', '<p>A Gazeta de Holanda, de Machado de Assis, é uma coleção de 48 crônicas em verso, publicadas sob o pseudônimo de Malvólio entre 1886 e 1888, que utiliza a estrutura de um jornal fictício para tecer comentários satíricos sobre a sociedade e a política do Rio de Janeiro da época. O cronista aborda com ironia temas como a corrupção eleitoral (incluindo a presença de nomes de defuntos nas listas de votação), as ineficiências parlamentares e os debates constitucionais sobre o poder moderador, a especulação financeira (mencionando a dívida Lamberti e novos bancos), e costumes sociais, satirizando a “ciência alugada” e a dificuldade de encontrar notícias. Malvólio frequentemente reflete sobre a condição humana e a lei darwiniana nos eventos cotidianos, intercalando essas observações com a cobertura de incidentes locais, como a fuga de uma onça e a persistência da capoeiragem, tudo com um tom leve e autoconsciente sobre o próprio ofício de rimar.</p>', '56596_Gazeta-de-Holanda---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/12993_Gazeta-de-Holanda---Machado-de-Assis.pdf', 0, '0', 0, 1),
(75, '9', '50,69,70', 21, 1, 'Bons Dias', '<p>A série de crônicas “Bons Dias!”, escrita por Machado de Assis, apresenta um narrador que se identifica como um “pobre relojoeiro” tornado escritor, que usa a coluna para comentar de forma irônica e conversacional os acontecimentos sociais e políticos do Rio de Janeiro entre 1888 e 1889. O cronista, que preza a “boa criação”, aborda temas como a abolição da escravatura (Lei de 13 de maio), expondo o cinismo e o interesse próprio nos atos abolicionistas, inclusive relatando sua própria libertação farsesca de um escravo, Pancrácio, e um engenhoso plano de obter indenização por “almas mortas”. Além disso, critica as incoerências da política parlamentar (como o descanso aos sábados e a suspensão de sessões por falecimento de membros), debates sobre reformas eleitorais (voto secreto contra público), a invasão de galicismos na língua portuguesa (e a proposta de neologismos como focáler e desempeno), e o fanatismo do espiritismo, rotulado como uma forma de “curanderia” que “deixa-os simplesmente doidos”. Com um tom cético e repleto de digressões humorísticas, o narrador observa a sociedade imperial em seu crepúsculo, disfarçando suas opiniões por trás de uma fachada de humildade e modéstia.<br /> </p>', '54244_Bons-dias---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/95264_Bons-Dias!---Machado-de-Assis.pdf', 0, '0', 2, 1),
(76, '9', '50,69,70', 21, 1, 'Badaladas', '<p>Badaladas é uma coletânea de crônicas de Machado de Assis, escritas sob o pseudônimo de \\\\\\\"Dr. Semana\\\\\\\", que oferece um panorama satírico e espirituoso da vida social, política e religiosa do Brasil entre 1871 e 1873. O autor emprega um tom irônico para dissecar a política do Império, satirizando a fragilidade do sistema eleitoral (comparado a corridas de cavalos) e a superficialidade dos debates parlamentares e jantares políticos, chegando a apresentar a cozinheira Celestina para fornecer uma analogia cômica sobre as leis e o voto. No campo religioso, critica a hipocrisia e a superstição, como a controvérsia sobre o território do Papa e o conceito de \\\\\\\"Marianismo\\\\\\\", bem como a recusa dos frades franciscanos em acolher doentes de febre amarela, priorizando a própria segurança. Além disso, o cronista dedica-se a comentários sociais diversos, tratando desde a grandiloquência na poesia contemporânea e a efemeridade dos relacionamentos anunciados em jornais, até observações sobre o comportamento público, como a \\\\\\\"insurreição do chapéu\\\\\\\" em um teatro, sempre utilizando a ironia e o humor para expor as contradições e a falta de profundidade da sociedade de sua época.</p>', '68862_Badaladas---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/94302_Badaladas---Machado-de-Assis.pdf', 0, '0', 51, 1),
(77, '7', '52,69,70,24,37', 21, 1, 'A m&atilde;o e a luva', '<p>A Mão e a Luva narra a ascensão e o dilema amoroso de Guiomar, uma jovem de origem humilde e dotada de grande sagacidade e ambição, que é acolhida e tratada como filha pela Baronesa, sua madrinha. Guiomar torna-se alvo de paixão de três homens: Estevão, um advogado sensível e fraco que se apaixona por ela duas vezes; Jorge, o sobrinho da Baronesa, vaidoso e superficial, cujo casamento a madrinha ardentemente deseja; e Luís Alves, amigo de Estevão, recém-eleito deputado, que é perspicaz e ambicioso. Guiomar rejeita Estevão por sua falta de força e Jorge por sua trivialidade, resistindo à pressão da madrinha. Após frustrar uma tentativa de fuga para o interior devido à presença inoportuna de Jorge e ao risco de cólera, Luís Alves aproveita a ocasião para declarar seu amor de forma direta e calculista. Guiomar, que busca um parceiro com a força para elevá-la à grandeza social que almeja, aceita Luís Alves por reconhecer em seu método resoluto e em sua ambição a garantia do destino que deseja, concluindo que o seu coração é guiado pela “fria eleição do espírito”.</p>', '55743_A-m&atilde;o-e-a-luva---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/69004_A-Mão-e-a-Luva---Machado-de-Assis.pdf', 0, '0', 7, 1),
(78, '7', '55', 17, 1, 'A pata da Gazela', '<p>O romance narra a ironia e o conflito de duas paixões pela mesma mulher, Amélia. O dândi Horácio de Almeida, um esteta materialista, fica obcecado por uma minúscula e primorosa botina que encontra na rua, idealizando-a como o \\\\\\\"pezinho de silfo\\\\\\\" que ele passa a adorar, o que o leva a cortejar e pedir Amélia em casamento, convicto de que ela é a dona do tesouro. Paralelamente, o idealista Leopoldo de Castro se apaixona pela alma e sorriso puro de Amélia, mas descobre que a moça esconde um pé disforme, um \\\\\\\"aleijão\\\\\\\", e luta para conciliar seu amor espiritual, que é capaz de aceitar a deformidade, com a repulsa física, enquanto Horácio permanece cego à verdade, sustentando sua adoração materialista por uma ilusão.</p>', '41430_A-pata-da-gazela---Jos&eacute;-de-Alencar.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/98663_A-pata-da-Gazela---José-de-Alencar.pdf', 0, '0', 7, 1),
(79, '7', '69,70,46,37', 52, 1, 'A nova Calif&oacute;rnia', '<p>A nova Califórnia é uma coleção de contos de Lima Barreto que oferece uma sátira mordaz da sociedade carioca e brasileira da época, explorando a obsessão pela riqueza fácil, a superficialidade social e a decadência moral. O cerne da obra reside na história-título, que narra como a pequena cidade de Tubiacanga é consumida pela ganância quando um químico, Raimundo Flamel, afirma ter o segredo para transformar ossos humanos em ouro, levando a população inteira a profanar sepulturas em uma orgia de violência e morte. Outros contos complementam essa crítica, como o de Fausto Carregal, que, em desespero pela falta de herdeiros intelectuais, queima a valiosa biblioteca de seu pai (“A BIBLIOTECA”), e a ironia de um caixeiro rico que paga caro a um médico famoso e charlatão por um diagnóstico de “não ter nada” (“A DOENÇA DO ANTUNES”). A coletânea, assim, expõe o contraste entre o idealismo e a crassa busca por ascensão social e fortuna.</p>', '49315_A-nova-Calif&oacute;rnia---Lima-Barreto.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/58107_A-nova-Califórnia---Lima-Barreto.pdf', 0, '0', 0, 1),
(80, '7', '24', 17, 0, 'A Viuvinha', '<p>A narrativa de A Viuvinha descreve a jornada de Jorge, um rapaz abastado que, após desperdiçar sua fortuna em três anos de falta de amor, encontra a redenção e o amor em Carolina, uma jovem inocente da Praia da Glória. No dia do casamento, o tutor de Jorge, Senhor Almeida, revela que ele está falido e com dívidas, incluindo dívidas de honra do pai, o que o conduzirá à ruína e à mancha do nome da família. Para salvar a pureza de Carolina da miséria e proteger a memória de seu pai do escárnio, Jorge simula seu suicídio com a ajuda de Almeida, abandonando a noiva, que se torna a “Viuvinha” em luto. Durante cinco anos, Jorge vive em expiação nos Estados Unidos e depois no Rio de Janeiro, sob o nome de Carlos Freeland, dedicando-se ao trabalho e à miséria voluntária para resgatar integralmente o nome de seu pai. Ao retornar, ele passa a cortejar Carolina anonimamente com uma flor e uma carta vazia, até que, após ela sucumbir a esse amor misterioso, Jorge revela sua verdadeira identidade em um encontro noturno no jardim. O casal se reconcilia, reunindo-se para viver a felicidade após provar a força de seu amor e honra em meio a cruéis provações.</p>', '81086_A-Viuvinha----Jos&eacute;-de-Alencar.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/27975_A-Viuvinha---José-de-Alencar.pdf', 0, '0', 9, 1),
(81, '11', '69,70,47', 21, 0, 'A cr&iacute;tica teatral: Jos&eacute; de Alencar: M&atilde;e', '<p>O texto é uma crítica teatral escrita por Machado de Assis sobre o drama original brasileiro <em>Mãe</em>, de José de Alencar, que o crítico avalia positivamente como um drama de “acabado perfeito” e uma surpresa agradável que eleva o nível da arte nacional. A trama central, de ação altamente dramática e simples, narra a história de Jorge, um estudante que vive com a escrava Joana. Para salvar a honra e a vida do pai de sua amada, Elisa, ameaçado pelo usurário Peixoto, Jorge tenta levantar dinheiro. Joana, compreendendo a situação e num ato de sacrifício, vende a si mesma para Peixoto a fim de obter a quantia necessária. O clímax se dá quando o Dr. Lima revela a Jorge que a escrava Joana era, na verdade, sua mãe (“Desgraçado, vendeste tua mãe!”), no momento em que ela reaparece envenenada para consumar seu martírio tocante, garantindo que sua origem humilde não causasse a cor do filho perante a sociedade. O crítico ressalta a relevância do drama em abordar o tema da escravidão com profundidade de sensibilidade e lógica dramática, comparando seu potencial de nomeada ao de <em>A Cabana do Pai Tomás</em>.</p>', '41109_A-cr&iacute;tica-teatral---Jos&eacute;-de-Alencar-M&atilde;e---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/74429_A-crítica-teatral---José-de-Alencar-Mãe---Machado-de-Assis.pdf', 0, '0', 2, 1),
(82, '11', '69,70', 21, 1, 'A nova gera&ccedil;&atilde;o', '<p>O texto é uma análise crítica da “nova geração poética” brasileira, que se manifesta como um movimento de transição, incompleto e difuso, que rejeita o Romantismo em declínio para buscar uma nova expressão animada por um espírito de fervor e convicção. Esta nova tendência resulta do esgotamento do lirismo subjetivo e do impacto do desenvolvimento das ciências modernas, inclinando-se para um otimismo triunfante e aspirações sociais como o advento da “Justiça”. Contudo, o movimento carece de uma doutrina estética clara, dividindo-se entre a influência do lirismo melancólico (como em Teófilo Dias e Alberto de Oliveira), o realismo sensualista (como em Carvalho Júnior), e a eloquência política hugoísta (como em Valentim Magalhães e Fontoura Xavier). O autor reconhece o talento e o vigor da juventude (como em Afonso Celso Júnior), mas adverte-a contra a imitação excessiva de modelos estrangeiros (V. Hugo e Baudelaire), o pedantismo científico e a falta de apuro formal, concluindo que, embora a geração demonstre uma forte intenção de renovação, a sua feição definitiva será alcançada apenas pelo desenvolvimento da originalidade e da arte individual ao longo do tempo.</p>', '54861_A-nova-gera&ccedil;&atilde;o---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/34447_A-nova-geração---Machado-de-Assis.pdf', 0, '0', 2, 1),
(83, '9', '69,70', 21, 1, 'Ao acaso (cr&ocirc;nicas da semana)', '<p>A série de Crônicas da Semana, escritas por Machado de Assis entre junho e setembro de 1864 e publicadas com o título \\\\\\\\\\\\\\\"Ao Acaso\\\\\\\\\\\\\\\", proporciona uma crítica social, cultural e política aguçada e irônica sobre a vida no Rio de Janeiro e no Brasil. O autor, utilizando o folhetim como plataforma, satiriza a hipocrisia e a falta de seriedade na política, criticando a superficialidade de figuras públicas (como o Senador Barão de S. Lourenço e as polêmicas de Lopes Netto sobre o México) e o descaso com as finanças e instituições públicas, exemplificado pelo ultrajante “Não caio nessa” do Marquês de Abrantes. Em contraste, Machado de Assis celebra os esforços intelectuais e artísticos da juventude acadêmica, a chegada de talentos teatrais como Emília das Neves, e as novas publicações literárias, ao mesmo tempo em que lamenta tragédias sociais como o suicídio de um veterano da Independência por miséria e critica o moralismo seletivo da imprensa religiosa (A Cruz), transformando a observação casual de eventos cotidianos em uma reflexão profunda sobre a vaidade, a moralidade e as contradições da sociedade de seu tempo.</p>', '5186_Ao-Acaso-(Cr&ocirc;nicas-da-Semana)---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/2311_Ao-Acaso-(Crônicas-da-Semana)---Machado-de-Assis.pdf', 0, '0', 0, 1),
(84, '9', '69,70', 21, 1, 'Coment&aacute;rios da semana (1861-1862)', '<p>A coleção de crônicas “Comentários da Semana” (1861-1862), assinada por “Gil” (Machado de Assis), apresenta um panorama conciso e muitas vezes satírico da vida na capital imperial. O foco central reside na crítica contundente à política e ao gabinete ministerial, taxado de medíocre, fatalista e ineficaz, que opera à margem da opinião pública e recorre a expedientes questionáveis. Culturalmente, o autor dedica atenção detalhada ao efervescente cenário artístico, em particular à temporada de ópera da companhia italiana (Thereza Parodi), ao progresso dos compositores e dramas nacionais, e à necessidade de uma escola normal de teatro. Os comentários também cobrem eventos sociais e diplomáticos da época, como a Exposição Industrial, a inauguração da estátua de D. Pedro I e a preocupação com a soberania nacional frente a incidentes como a visita inglesa a navio brasileiro, além de registrar a atividade de associações de caridade e a morte de personalidades como Paula Brito.</p>', '75831_Coment&aacute;rios-da-semana---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/98196_Comentários-da-semana---Machado-de-Assis.pdf', 0, '0', 0, 1),
(85, '11', '69,70', 21, 1, 'Cr&iacute;tica teatral', '<p>A crítica teatral de Machado de Assis diagnostica a decadência do teatro nacional e a indiferença do público, atribuídas aos excessos do Ultra-romanticismo e Ultra-realismo, e propõe como solução urgente a intervenção do Estado para a criação de um “teatro normal” e um conservatório dramático, visando a reforma do gosto público e o estabelecimento de um padrão literário. O documento avalia, em seguida, os principais autores: Gonçalves de Magalhães é reconhecido como o fundador do teatro brasileiro, mas seu talento é classificado como lírico, e não propriamente dramático. José de Alencar é altamente elogiado por obras como <em>O Demônio Familiar</em> (alta comédia de costumes) e, principalmente, <em>Mãe</em>, considerado o melhor drama nacional pela sua profunda crítica social à escravidão e à sublime representação da maternidade da escrava Joana. Por fim, Joaquim Manuel de Macedo é criticado por ter se desviado do caminho promissor de suas primeiras peças para um gênero inferior, caracterizado pelo burlesco e pela sátira fácil em obras como <em>Luxo e Vaidade</em> e <em>Lusbela</em>, comprometendo a correção dos caracteres e a seriedade da arte.</p>', '55735_Cr&iacute;tica-Teatral---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/64021_Crítica-Teatral---Machado-de-Assis.pdf', 0, '0', 0, 1),
(86, '7', '52,55,24', 17, 1, 'Iracema', '<p>O romance Iracema, de José de Alencar, narra a trágica lenda da fundação do Ceará e do nascimento do povo brasileiro, através do amor proibido entre o guerreiro português Martim e Iracema, a virgem-sacerdotisa da nação Tabajara, cujo nome significa \\\"lábios de mel\\\". A união, consumada após Martim beber o vinho sagrado da jurema, é uma violação dos ritos de Tupã e acende a fúria do ciumento chefe Irapuã, forçando Martim e Iracema a fugir para o litoral, onde se aliam aos Pitiguaras, liderados pelo fiel Poti. Mesmo com as vitórias de Martim e Poti (que se torna o famoso Camarão) sobre os inimigos, a felicidade do casal é minada pela saudade da pátria que Martim sente e pela tristeza e desenraizamento de Iracema. A narrativa se encerra com a morte de Iracema por melancolia após o nascimento de Moacir, o primeiro cearense, e com Martim retornando anos mais tarde para estabelecer uma vila cristã naquelas terras, representando o encontro fatal entre as culturas indígena e cristã.</p>', '50845_Iracema---Jos&eacute;-de-Alencar.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/33113_Iracema---José-de-Alencar.pdf', 0, '0', 5, 1),
(87, '9', '69,70,46,37', 21, 1, 'Cr&ocirc;nicas do Dr. Semana', '<p>As Crônicas do Dr. Semana, publicadas no jornal A Semana Ilustrada, constituem uma sátira social e política do Rio de Janeiro do século XIX, usando a persona de um cronista-charlatão que se apresenta como médico e gramático. O texto critica a corrupção política, a ineficácia da administração municipal em lidar com problemas como a sujeira das ruas e a falta de asseio público, e a hipocrisia de diversos tipos sociais, os quais são pejorativamente definidos como “carrapatos políticos”. Por meio de seções burlescas, como a “Clínica Cirúrgica” (onde o Dr. Semana descreve procedimentos médicos absurdos) e as “Preleções de Gramática” (onde os elementos gramaticais são redefinidos para satirizar o cotidiano carioca), o autor ironiza desde a ineficiência do parlamento e os escândalos financeiros em obras públicas (como o Passeio Público) até as frivolidades da vida teatral e os costumes da sociedade da corte, mantendo um tom de humor e escárnio.</p>', '2184_Cr&ocirc;nicas-do-Dr.-Semana---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/7998_Crônicas-do-Dr.-Semana---Machado-de-Assis.pdf', 0, '0', 2, 1),
(88, '9', '69,70,46,37', 21, 1, 'O futuro (cr&ocirc;nicas)', '<p>A coletânea de crônicas de Machado de Assis, intitulada O futuro, oferece um panorama detalhado e crítico da vida brasileira entre setembro de 1862 e julho de 1863, abordando questões políticas, literárias e artísticas da Corte do Rio de Janeiro. O cronista inicia com o propósito de relatar os fatos da quinzena sem se envolver em polêmicas, mas rapidamente mergulha em comentários sobre a “pesada herança” de 1862, que inclui a crise diplomática com o Peru na questão do Amazonas e a tensão das reclamações inglesas. Em meio a reflexões sobre a política instável e a indiferença do governo, a obra celebra o florescente, embora ainda incipiente, movimento literário e dramático nacional, dedicando espaço a análises de poemas como D. Jaime de Thomaz Ribeiro, romances como As minas de prata de José de Alencar, e peças de teatro, como A Túnica de Nessus de Nabuco de Araújo, além de elogiar talentos musicais como Arthur Napoleão. As crônicas misturam observação sagaz e ironia sobre a sociedade, o clero e a lentidão do progresso, contrastando a ambição do título (“O futuro”) com a realidade crítica do presente.</p>', '36097_Cr&ocirc;nicas-O-futuro---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/98604_Crônicas-O-futuro---Machado-de-Assis.pdf', 0, '0', 0, 1),
(89, '7', '52,69,70,24,37', 21, 1, 'Dom Casmurro', '<p>O romance se inicia com o narrador, Bento Santiago (conhecido como Dom Casmurro), explicando que escreve para reviver a juventude, uma vez que a reprodução física de sua antiga casa não foi suficiente para restaurar seu eu adolescente. O drama começa quando ele ouve o agregado José Dias denunciar a D. Glória, mãe de Bento, que ele e a vizinha Capitu andam em “segredinhos”, instigando-a a cumprir a promessa de o enviar ao seminário quanto antes. Essa “denúncia” força Bento a reconhecer seu amor por Capitu, o que é imediatamente confirmado ao vê-la riscar o nome dos dois em um muro. Os jovens, determinados a resistir à ordenação e à separação, elaboram um plano para manipular a vaidade de José Dias e persuadi-lo a advogar para Bento estudar Direito em São Paulo, ao invés de se tornar padre. O acordo é selado com o primeiro beijo, dado sob a desculpa de um penteado, que consagra o narrador à vida adulta.</p>', '69058_Dom-Casmurro---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/25486_Dom-Casmurro---Machado-de-Assis.pdf', 0, '0', 3, 1),
(90, '11,8', '69,70', 21, 1, 'Ensaios Liter&aacute;rios e Cr&iacute;ticos de Machado de Assis', '<p>A coletânea de ensaios e críticas de Machado de Assis, datados entre 1858 e 1864, reflete o panorama literário e social do Brasil oitocentista, focando na urgência de uma literatura nacional autêntica, desvinculada das influências ultramarinas e do foco excessivo no progresso material. O autor defende o jornal como o molde democrático e dinâmico ideal para a propagação da ideia e da discussão, em detrimento do livro. Além disso, critica veementemente o estado da arte dramática brasileira, marcada pela falta de iniciativa e pelo “caos” de traduções francesas, defendendo uma reforma que estimule as vocações locais e reestruture o Conservatório Dramático para que este exerça uma crítica literária séria e moralizadora.</p>', '44775_Ensaios-Liter&aacute;rios-e-Cr&iacute;ticos-de-Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/45045_Ensaios-Literários-e-Críticos-de-Machado-de-Assis.pdf', 0, '0', 0, 1),
(91, '6', '69,70', 21, 1, 'Falenas', '<p>Falenas é uma coletânea de poesia de Machado de Assis que explora temas do lirismo romântico e do crescente ceticismo. A obra navega entre a contemplação da natureza e o amor idealizado, como visto em poemas que exaltam a juventude e a beleza feminina (“FLOR DA MOCIDADE,” “MUSA DOS OLHOS VERDES”), e a amargura da desilusão, frequentemente associada à efemeridade da vida e das paixões (“O VERME,” “LÁGRIMAS DE CERA”). Um forte contraste entre o idealismo puro e a realidade pragmática marca composições mais longas, como a peça em versos “UMA ODE DE ANACREONTE,” onde o poeta Cleon sucumbe ao cinismo de Lísias e à volubilidade de Mirto, e o extenso poema narrativo “PÁLIDA ELVIRA,” que traça a trajetória de Heitor, um poeta que abandona o amor casto e a vida simples (Elvira) em busca de glória e prazeres mundanos, apenas para retornar desiludido e ser confrontado pela tragédia e pela morte da inocência.</p>', '7810_Falenas---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/21542_Falenas---Machado-de-Assis.pdf', 0, '0', 2, 1),
(92, '7', '69,70,47', 21, 1, 'Desencantos', '<p>Desencantos de Machado de Assis é uma fantasia dramática em duas partes que narra o desenrolar de um triângulo amoroso e o choque entre o idealismo romântico e o pragmatismo social. Na primeira parte, em Petrópolis, Luís de Melo, o idealista, corteja a viúva Clara de Souza com fervor poético, comparando-a a uma “violeta” e discutindo a natureza do amor, enquanto seu rival, Pedro Alves, se apresenta como um “espírito sólido” que se vale de títulos práticos como fortuna e posição social; a disputa culmina com Clara aceitando Pedro Alves, levando Luís ao “desencanto” e a uma viagem de cinco anos ao Oriente em busca da “exceção” que o mundo cristão não lhe deu. Ao retornar à Corte na segunda parte, Luís reencontra Clara, agora casada e insatisfeita com a vida conjugal e política de Pedro Alves, e, em um movimento de sutil reviravolta e ironia, ele demonstra ter superado o seu desencanto ao pedir a mão da filha de Clara, também chamada Clara (Clarinha), uma jovem pura e idealizada, concluindo que o verdadeiro desengano agora recai sobre a vida do casal, e não sobre ele.</p>', '38110_Teatro---Desencantos---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/99867_Teatro---Desencantos---Machado-de-Assis.pdf', 0, '0', 2, 1),
(93, '9', '69,70,46', 21, 0, 'Hist&oacute;ria de Quinze Dias', '<p>A crônica de Machado de Assis, “História de Quinze Dias”, é um vasto painel da vida brasileira e internacional entre julho de 1876 e janeiro de 1878, marcada pela observação irônica e profunda do autor. O texto navega entre o colapso do Império Otomano e a ascensão do constitucionalismo turco, e questões locais no Rio de Janeiro, como a febre da ópera e dos tenores caros, a manipulação eleitoral, o problema urbano do chumbo nos canos de água, e os costumes sociais como o carnaval moribundo e as touradas. Através dessa mistura de temas grandiosos e triviais, o cronista comenta sobre a soberania nacional, a educação e a natureza humana, prestando homenagens a figuras como José de Alencar e Zacarias, revelando o talento de Machado em entrelaçar crítica social, filosofia e a efemeridade do cotidiano.</p>', '89868_Hist&oacute;ria-de-Quinze-Dias---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/65111_História-de-Quinze-Dias---Machado-de-Assis.pdf', 0, '0', 1, 1),
(94, '7', '50,52,69,70,24', 52, 0, 'Vida e morte de M. J. Gonzaga de S&aacute;', '<p>Vida e Morte de M. J. Gonzaga de Sá, de Lima Barreto, é um romance que, por meio das memórias e observações do narrador Augusto Machado, retrata a figura melancólica e reflexiva de Gonzaga de Sá, um funcionário público que vive à margem das ambições sociais. A obra combina crítica à burocracia, à sociedade carioca e às ilusões do progresso, com uma visão introspectiva sobre a existência, marcada pelo desencanto, pela solidão e pela busca de sentido na vida cotidiana.</p>', '26672_Vida-e-morte-de-M.-J.-Gonzaga-de-S&aacute;---Lima-Barreto.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/77750_Vida-e-morte-de-M.-J.-Gonzaga-de-Sá---Lima-Barreto.pdf', 0, '0', 1, 1),
(95, '9', '50,69,70,37,51', 52, 0, 'Vida Urbana', '<p>Vida Urbana é uma coletânea de crônicas de Lima Barreto publicadas entre 1911 e 1918, que constitui uma crítica social e política incisiva e mordaz sobre o Rio de Janeiro no início do século XX. O autor analisa e satiriza os costumes e vícios da capital, desde a superficialidade da alta sociedade (“Binóculo”) e a falta de engajamento intelectual das mulheres brasileiras, até a mediocridade do jornalismo, que priorizava notícias triviais e diários sociais em detrimento de reportagens sérias. Barreto também ataca a ineficiência da administração pública, o excesso de regulamentação, a corrupção e a proliferação de sinecuras no governo, ao mesmo tempo em que critica a obsessão nacional pelos títulos de “doutor” e defende a autonomia individual e a justiça mais sensível aos fatos da vida real, como no debate sobre o júri e a violência passional.</p>', '95268_Vida-Urbana---Lima-Barreto.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/58292_Vida-Urbana---Lima-Barreto.pdf', 0, '0', 0, 1),
(96, '7', '54', 52, 1, 'Coletânea de contos de Lima Barreto', '<p>A coletânea de contos de Lima Barreto oferece um panorama crítico e satírico da sociedade carioca do início do século XX, expondo a mediocridade, a hipocrisia e a corrupção do ambiente burguês e burocrático. As narrativas exploram o tédio existencial da classe média, levando a personagens como Zilda a buscar escapismo em práticas ilícitas como o jogo do bicho (Número da Sepultura). A crítica à burocracia é central, demonstrando como o funcionalismo público prioriza o nepotismo e a lisonja sobre o mérito, resultando no triunfo de figuras pernósticas como o Dr. Mata-Borrão (Três Gênios de Secretária) e em disputas mesquinhas por promoções (Milagre do Natal). Além disso, o autor aborda a tragédia do abandono e do preconceito social, com a chocante descoberta de uma filha tornada amante (Um Especialista) e o sofrimento do deslocamento e da falta de afeto que levam o jovem Horácio, filho de uma cozinheira, a um colapso nervoso, destacando a insensibilidade e as arestas cortantes do mundo ao seu redor (O Filho de Gabriela).</p>', '24597_Colet&acirc;nea-de-Contos-de-Lima-Bareto.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/47332_Coletânea-de-Contos---Lima-Barreto.pdf', 0, '0', 1, 1),
(97, '12', '57', 53, 0, 'A Chave do tamanho', '<p>Determinada a acabar com a guerra que entristecia Dona Benta, Emília usa o superpó do Visconde para viajar à Casa das Chaves, mas baixa acidentalmente a “Chave do Tamanho”, reduzindo toda a “humanidade clássica” (incluindo ela mesma a um centímetro) ao tamanho de insetos (“homitos”), o que destrói a civilização e impõe uma “Ordem Nova” onde os perigos são agora o pinto sura, gatos e a passarinhada, enquanto objetos e seres vegetais como o Visconde mantêm o tamanho original. Para sobreviver nesse novo “mundo biológico”, Emília se adapta utilizando rapidamente a inteligência e o mimetismo do algodão (“chumacismo”), torna-se tutora dos órfãos Juquinha e Candoca (cujos pais foram devorados pelo gato Manchinha), e se reúne com o Visconde, a quem convence da superioridade da vida sem o “trambolho do Tamanho” e propõe um “plebiscito” entre os homenzinhos para decidir se a nova humanidade deve restaurar ou não sua estatura antiga.</p>', '18539_A-Chave-do-tamanho.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/55755_A-Chave-do-tamanho---Monteiro-Lobato-(OK).pdf', 0, '0', 3, 1),
(99, '7', '64,49', 25, 0, 'A parceria do gato e o rato', '<p>O conto “A parceria do gato e o rato”, dos Irmãos Grimm, narra a falsa amizade entre um gato e um rato que decidem morar juntos e guardar um pote de banha na igreja para o inverno. O gato, no entanto, inventa três desculpas, alegando ser padrinho de batismo, para ir secretamente à igreja e comer a banha em três partes: a primeira, que ele chama de “Em cima já era”; a segunda, “Metade já foi”; e, por fim, “Acabou tudo”. Quando o inverno chega e o rato sugere que eles comam a banha guardada, descobrem que o pote está vazio. Ao perceber que o gato comeu tudo e ligar os nomes dos batismos ao roubo da comida, o rato o confronta, mas o gato, sem paciência, o devora, provando que a parceria era uma farsa e que “esses são os caminhos do mundo”.<br /> </p>', '54107_A-parceria-do-gato-e-o-rato---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/73464_A-parceria-do-gato-e-o-rato---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(100, '7', '64,49', 25, 0, 'A protegida de Nossa Senhora', '<p>A história de \\\"A protegida de Nossa Senhora\\\" narra a vida de uma garota que, devido à pobreza de seus pais, é levada pela Virgem Maria para ser criada no céu. Aos quatorze anos, enquanto a Virgem viaja, ela confia à jovem as chaves das treze portas do céu, proibindo-a de abrir a décima terceira. Movida pela curiosidade, a garota desobedece e abre a porta proibida, vendo a Trindade e tocando o fogo sagrado, que deixa seu dedo coberto de ouro. Ao retornar, a Virgem Maria descobre a desobediência e a subsequente mentira da garota, banindo-a para a Terra em um deserto, onde ela fica muda e é forçada a viver em uma árvore oca. Anos depois, ela é encontrada por um rei, que se casa com ela. No entanto, após o nascimento de seus três filhos, a Virgem Maria aparece três vezes exigindo a confissão do pecado para que ela recupere a voz e os filhos, mas a rainha insiste na mentira, e as crianças são levadas. Acusada de devorar os próprios filhos, ela é condenada a ser queimada viva; somente no momento da execução, tomada por arrependimento, ela confessa seu pecado em voz alta, sendo imediatamente perdoada pela Virgem Maria, que extingue o fogo, devolve-lhe os três filhos e a fala, concedendo-lhe a felicidade.</p>', '80794_A-protegida-de-Nossa-Senhora---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/61184_A-protegida-de-Nossa-Senhora---Irmãos-Grimm.pdf', 0, '0', 1, 1),
(101, '7', '64,49', 25, 0, 'A hist&oacute;ria do garoto que saiu para aprender o que era o medo', '<p>O conto narra a história de um jovem tolo que não sabia o que era sentir medo e, por isso, decide sair pelo mundo para aprender essa “arte”. Após ser expulso de casa por acidentalmente quebrar a perna de um sacristão que tentava assustá-lo, o garoto tenta, sem sucesso, sentir medo em um patíbulo. Ele então se propõe a passar três noites em um castelo assombrado, em troca de se casar com a filha do rei. Durante as três noites, ele enfrenta e derrota gatos demoníacos, fantasmas, mortos-vivos e um homem barbudo que o ameaça, mas permanece destemido. Por fim, ele liberta o castelo, casa-se com a princesa, mas ainda lamenta não saber o que é o medo. Sua esposa resolve o problema ao derramar um balde de água fria cheio de peixes gobiões sobre ele enquanto dorme, fazendo-o finalmente experimentar e reconhecer o sentimento de medo.</p>', '61187_A-hist&oacute;ria-do-garoto-que-saiu-para-aprender-o-que-era-o-medo---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/86703_A-história-do-garoto-que-saiu-para-aprender-o-que-era-o-medo---Irmãos-Grimm.pdf', 0, '0', 2, 1),
(102, '7', '64,49', 25, 0, 'O lobo e os sete cabritinhos', '<p>A história narra sobre uma mãe cabra que avisa seus sete cabritinhos para terem cuidado com o lobo, que pode ser reconhecido por sua voz grossa e patas pretas, antes de ir buscar comida na floresta. O lobo tenta enganar as crianças por duas vezes, primeiro suavizando sua voz comendo barro e depois cobrindo suas patas negras com massa e farinha para que pareçam brancas. Na terceira tentativa, ele consegue persuadir os cabritos, adentra a casa e devora seis deles por completo, já que o mais novo se esconde na caixa do relógio. A mãe volta, reconhece o filho que sobreviveu e juntos encontram o lobo adormecido. Ela abre a barriga do lobo, resgata os seis cabritinhos ilesos e substitui-os por grandes pedras, costurando-o novamente. Quando o lobo acorda e vai beber água em um poço, o peso das pedras o faz cair e se afogar miseravelmente, garantindo que a mãe e os sete cabritinhos dancem de alegria pelo fim do perigo.</p>', '7277_O-lobo-e-os-sete-cabritinhos---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/23405_O-lobo-e-os-sete-cabritinhos---Irmãos-Grimm.pdf', 0, '0', 1, 1),
(103, '7', '64,49', 25, 0, 'Jo&atilde;o, o fiel', '<p>João, o fiel, promete ao rei moribundo proteger seu jovem filho do retrato da Princesa do Palácio de Ouro, mas o novo rei, ao vê-la, apaixona-se sendo ajudado por João a sequestrá-la. Durante a viagem, João ouve corvos profetizarem três perigos fatais para o rei, sabendo que, se intervir para salvar seu amo, se transformará em pedra. João impede o rei de ser morto pelo cavalo e pelo traje de núpcias e, finalmente, salva a rainha sugando o veneno, completando sua petrificação e sendo condenado injustamente. João revela a profecia antes de se tornar uma estátua; anos depois, a estátua informa ao rei que só ressuscitará se ele sacrificar seus filhos gêmeos, o qual, em demonstração de suprema gratidão, o faz. João então é restituído à vida e, em seguida, ressuscita as crianças, permitindo que a família viva feliz.</p>', '29230_Jo&atilde;o,-o-fiel---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/94745_João,-o-fiel---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(104, '9', '52,69,70', 52, 0, 'Cr&ocirc;nicas de Lima Barreto', '<p>Esta coletânea de crônicas de Lima Barreto oferece uma crítica social aguda e irônica da sociedade brasileira no início do século XX, especialmente no Rio de Janeiro. O autor denuncia a República como um regime de “fachada”, ostentação e luxo superficial que esconde a miséria generalizada da população e questiona a utilidade de leis e regulamentos burocráticos que oprimem os humildes e até sacrificam vidas, como no caso do aborto ou do uxoricídio por adultério, um costume que ele considera uma barbárie. Critica veementemente a “doutomania”, a ineficiência do ensino superior, a corrupção e a cultura dos “banquetes” entre as elites, lamentando também a falta de apoio e influência intelectual da mulher brasileira sobre seus homens de cultura. Em meio à abordagem de problemas urbanos, como enchentes, carestia da vida e o absurdo do encarecimento dos aluguéis, o autor observa o lado mais humano e menos racional da vida, como o amor popular pelos animais e a necessidade de ilusões, concluindo com um apelo pela reforma econômica e social da agricultura para combater a miséria.</p>', '83168_Cr&ocirc;nicas---Lima-Barreto.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/19161_Crônicas---Lima-Barreto.pdf', 0, '0', 0, 1),
(105, '7', '48,50,69,70', 21, 0, 'Hoje avental, amanh&atilde; luva', '<p>A comédia <em>Hoje avental, amanhã luva</em>, de Machado de Assis, narra a vingança da espirituosa criada Rosinha contra Durval, um homem rico que retorna ao Rio de Janeiro após dois anos para reconquistar a Sr.ᵃ Sofia de Melo, ama de Rosinha. Rosinha, que Durval tentou seduzir e desprezar anteriormente, executa um plano: primeiro, ela o desilude sobre Sofia, revelando que sua beleza é artificial (“pó de arroz”) e que ela o considerava um “urso”. Em seguida, com a ajuda do cocheiro Bento disfarçado, Rosinha simula a presença de um ardente pretendente, um fidalgo espanhol (Don Alonso), que a espera para o baile de Carnaval. Pressionado pela ameaça de perder Rosinha para o suposto nobre e já desencantado com Sofia, Durval se declara apaixonado pela criada, oferecendo-lhe sua mão e fortuna. Rosinha aceita a proposta, concretizando sua ascensão social e sua vingança, e parte para o baile com Durval, que fica duplamente enganado.</p>', '47864_Hoje-avental,-amanh&atilde;-luva.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/5635_Hoje-avental,-amanhã-luva---Machado-de-Assis.pdf', 0, '0', 0, 1),
(106, '6', '53,27,32', 4, 0, 'Os Timbiras', '<p>“Os Timbiras”, de Gonçalves Dias, narra o conflito iminente entre a tribo Timbira e a tribo Gamela. O chefe Timbira, Itajubá, inicia a tensão ao matar o líder Gamela em um duelo, mas sua invulnerabilidade é questionada por um ferimento de flecha, encorajando os Gamelas a buscarem vingança. Apesar de convocar seu vasto exército, Itajubá envia o mensageiro Jurucei para oferecer paz e exigir que os Gamelas demarquem o local da morte do líder rival como sinal de submissão. Paralelamente aos preparativos de guerra, Itajubá é assombrado pela dor de ter perdido sua amada Coema para Tupinambás traiçoeiros e pela ausência do jovem guerreiro Jatir, que se torna uma preocupação central, especialmente após um sonho do guerreiro Mojacá sugerir que Jatir está prestes a ser sacrificado pelos inimigos. No acampamento Gamela, após a deliberação dos guerreiros, o chefe Gurupema e sua gente rejeitam a proposta de paz; o mensageiro Jurucei, ao denunciar a covardia e perfídia dos Gamelas, é atingido por uma flecha, selando o fracasso da missão e precipitando a guerra de vingança prometida por Itajubá.</p>', '43856_Os-Timbiras---Gon&ccedil;alves-Dias.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/43726_Os-Timbiras---Gonçalves-Dias.pdf', 0, '0', 5, 1),
(107, '7', '52,55', 17, 0, 'Lucíola', '<p>O personagem principal, Paulo, ao desembarcar no Rio de Janeiro em 1855, se encanta pela cortesã Lúcia, cuja elegância e aparente pureza contrastam com sua vida luxuosa e desregrada, provocando nele uma profunda inquietação moral e desejo. Depois de um começo conturbado, caracterizado pela sensualidade e desleixo público, como no jantar de Sá, onde Lúcia se expõe para “pagar a conta”, eles começam um relacionamento intenso e apaixonado. No entanto, as fofocas sociais o ferem, fazendo com que ele exijasse.</p>', '91784_Luc&iacute;ola---Jos&eacute;-de-Alencar.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/20474_Lucíola---José-de-Alencar.pdf', 0, '0', 2, 1),
(108, '7', '52,69,70', 52, 0, 'Clara dos Anjos', '<p>O excerto do romance “Clara dos Anjos” apresenta a família do carteiro Joaquim dos Anjos: ele e sua esposa, Engrácia, residem no subúrbio e educam a filha Clara, de 17 anos, em um isolamento estrito. Clara, ingênua e romântica, nutre o sonho do amor por meio das modinhas. A tranquilidade familiar é perturbada pela chegada de Cassi Jones de Azevedo, um “modeiro” habilidoso, mas um sedutor notório e cínico.</p>', '90111_Clara-dos-Anjos---Lima-Barreto.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/46114_Clara-dos-Anjos---Lima-Barreto.pdf', 0, '0', 1, 1),
(109, '7', '64,49,33', 25, 0, 'Os músicos de Bremen', '<p>Quatro animais de idade avançada e sob risco de vida de seus proprietários, um burrinho, um cão, um gato e um galo, abandonam suas casas e se juntam na estrada, optando por se estabelecerem em Bremen para se tornarem músicos. Sem conseguir chegar à cidade no mesmo dia, eles se deparam com uma casa de ladrões na floresta e, ao empilhar seus sons (urros, latidos, miados e cantos), conseguem intimidar os ladrões, que fogem aterrorizados, acreditando que a residência estava sendo invadida por espíritos. Os animais apropriam-se da mesa farta e se instalam para a noite, contudo, o líder dos ladrões envia um deles de volta para verificar a casa. O ladrão mensageiro é atacado simultaneamente por um gato, um cão e um burrito, além de escutar o canto do galo no telhado. Ele foge, relatando que a casa estava repleta de uma bruxa, um homem armado com uma faca, um ser sombrio e um magistrado. Depois desse incidente, os ladrões desistem de entrar na casa novamente, e os quatro músicos de Bremen permanecem morando nela para sempre.</p>', '43505_Os-m&uacute;sicos-de-Bremen---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/24978_Os-músicos-de-Bremen---Irmãos-Grimm.pdf', 0, '0', 2, 1),
(110, '7', '64,49', 25, 0, 'O alfaiate valente', '<p>A história narra as aventuras de um pequeno alfaiate que, após matar sete moscas com um golpe, borda uma faixa que diz \"Sete com um só golpe!\" e parte pelo mundo. Sua esperteza, e não sua força real, o faz enganar um gigante, provando falsamente sua bravura e conseguindo chegar a um reino onde é confundido com um poderoso guerreiro. O rei, querendo se livrar dele, impõe três tarefas perigosas: matar dois gigantes, capturar um unicórnio e prender um javali selvagem. Usando sua astúcia, o alfaiate completa todas as missões, casa-se com a princesa e se torna rei. Quando a rainha descobre sua verdadeira origem e tenta se livrar dele com a ajuda do pai, o alfaiate frustra a trama reafirmando em voz alta suas proezas, assustando os criados e garantindo seu reinado até o fim de seus dias.</p>', '59439_O-alfaiate-valente---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/87464_O-alfaiate-valente---Irmãos-Grimm.pdf', 0, '0', 1, 1),
(111, '7', '49,58', 7, 0, 'A Dan&ccedil;a dos Ossos', '<p>O conto “A Dança dos Ossos” narra a experiência aterrorizante do barqueiro Cirino, que testemunhou os ossos dispersos de Joaquim Paulista se juntarem e dançarem em sua cova mal-assombrada, culminando com o esqueleto o carregando pelos ares. A assombração é resultado do assassinato cruel de Joaquim por Timóteo, motivado por ciúmes de Carolina. O corpo de Joaquim foi mal enterrado e depois espalhado por bichos, gerando a crença popular de que a sepultura permanecerá aberta até que todos os seus ossos sejam reunidos.</p>', '5093_A-Dan&ccedil;a-dos-Ossos---Bernardo-Guimar&atilde;es.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/89405_A-Dança-dos-Ossos---Bernardo-Guimarães.pdf', 0, '0', 0, 1),
(112, '7', '49,69,70', 52, 0, 'Contos de Lima Barreto', '<p>A coletânea de contos e crônicas de Lima Barreto, Contos de Lima Barreto, apresenta um panorama satírico e mordaz da sociedade brasileira da época, com forte foco no Rio de Janeiro, expondo a profunda mediocridade, a corrupção e o parasitismo do funcionalismo público (“Três gênios de secretaria”, “Lourenço, o Magnífico”), o tédio da vida burguesa e os caminhos absurdos da ambição e da vaidade (“O número da sepultura”, “Milagre do Natal”, “O jornalista”). Através de narrativas que vão do cômico ao trágico, o autor critica a futilidade da alta sociedade e a exploração política (como na alegoria de “O falso d. Henrique V” na Bruzundanga), enquanto humaniza a dor e os costumes das classes populares e subalternas, seja na resignação de um homem simples que lamenta a perda de seus bois (“Manel Capineiro”) ou na sátira sobre a burocracia do além que relega a alma de um negro virtuoso ao purgatório por sua cor (“O pecado”). No geral, a obra revela uma visão pessimista da natureza humana e das instituições, onde a mediocridade e a falta de caráter são frequentemente a chave para o sucesso social e político.</p>', '69476_Contos-de-Lima-Barreto.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/95409_Contos-de-Lima-Barreto.pdf', 0, '0', 0, 1);
INSERT INTO `tbl_books` (`id`, `cat_id`, `section_ids`, `aid`, `featured`, `book_title`, `book_description`, `book_cover_img`, `book_file_type`, `book_file_url`, `total_rate`, `rate_avg`, `book_views`, `status`) VALUES
(113, '7', '53,36,40,24', 13, 0, 'Filomena Borges', '<p>“Filomena Borges” narra a tumultuada vida conjugal de João Borges, o rico e simples “João Touro”, com a romântica e insatisfeita Filomena. Desprezando o marido “burguês”, ela nega a ele seus “direitos adquiridos”, condicionando a consumação do casamento a uma série de sacrifícios e transformações: Borges é forçado a mudar radicalmente sua aparência e hábitos (abandonar o rapé, usar cosméticos e espartilho, aprender a valsar) e a buscar um título de nobreza. Essa busca implacável por status e extravagância leva o casal a uma vida de viagens frenéticas, desde a Europa ao Oriente, e à ruína financeira. O ápice do relacionamento conjugal ocorre quando Borges, desesperado, representa um sequestro violento em Sevilha. Depois disso, Filomena, impulsionada pela emoção do perigo e da força, aceita-o como seu \"raptor e amante\". No entanto, a relação ainda é caracterizada pela constante procura da esposa por \"comoções\" e pelo progressivo declínio moral de Borges.</p>', '26836_Filomena-Borges---Alu&iacute;sio-Azevedo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/72190_Filomena-Borges---Aluísio-Azevedo.pdf', 0, '0', 0, 1),
(114, '7', '24', 54, 0, 'Os trabalhadores do mar', '<p>O romance Os trabalhadores do Mar, de Victor Hugo e traduzido por Machado de Assis, é dedicado à ilha de Guernesey e serve como um estudo sobre a luta do homem contra a fatalidade da natureza. A trama é introduzida através de Gilliatt, um jovem marinheiro solitário e impopular, considerado feiticeiro por seus vizinhos. Sua vida de isolamento é abalada quando a bela e inocente Déruchette, sobrinha e afilhada do respeitado armador Mess Lethierry, escreve o nome dele na neve. Lethierry, um ex-marinheiro abastado, investiu o restante de sua fortuna após ser roubado pelo sócio Rantaine, construindo o Durande, o primeiro e bem-sucedido navio a vapor do Canal da Mancha, que se tornou sua segunda paixão e o dote de Déruchette. Enquanto Gilliatt nutre secretamente seu amor por Déruchette, observando-a e tocando a melodia “Bonny Dundee” no bagpipe perto de sua casa, o cenário se prepara para um evento que liga os personagens quando Gilliatt, em uma manhã de sol após uma borrasca, salva um jovem desconhecido, que parecia ser um padre, de se afogar na perigosa Cadeira Gild-Holm-\'Ur.</p>', '72308_Os-trabalhadores-do-mar---Victor-Hugo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/16858_Os-trabalhadores-do-mar---Victor-Hugo.pdf', 0, '0', 15, 1),
(115, '7', '58,24,37', 7, 0, 'A Escrava Isaura', '<p>O enredo se desenrola na próspera fazenda de Campos, no Rio de Janeiro, onde Isaura, uma escrava jovem e inteligente, é afilhada da falecida mãe de seu novo senhor, Leôncio. Leôncio é um homem dissoluto que nutre uma paixão violenta e obsessiva por Isaura. Sua esposa, Malvina, quer libertar Isaura, mas o assédio de Leôncio atrai a atenção de seu cunhado, Henrique, e leva Malvina a se sentir traída e a exigir que o marido se livre da escrava. A tentativa de Miguel, pai de Isaura, de adquirir sua liberdade é frustrada pela morte do comendador (pai de Leôncio), tornando Leôncio o único e inalterável senhor. Malvina abandona a casa, e Leôncio, livre, submete Isaura a trabalhos forçados e a ameaças de violência (incluindo o tronco) para forçá-la a ceder. Temendo o destino trágico de sua mãe, Isaura concorda em fugir com Miguel.</p>', '56904_A-Escrava-Isaura---Bernardo-Guimar&atilde;es.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/4361_A-Escrava-Isaura---Bernardo-Guimarães.pdf', 0, '0', 1, 1),
(116, '9', '69,70', 52, 0, 'O Subterr&acirc;neo do Morro do Castelo', '<p>O Subterrâneo do Morro do Castelo é uma coletânea de crônicas de Lima Barreto, publicadas no Correio da Manhã em 1905, que documenta e ficcionaliza as descobertas de galerias subterrâneas durante o arrasamento do Morro do Castelo, no Rio de Janeiro, para a construção da Avenida Central. O tema central é a busca pelos “fabulosas riquezas” que, segundo a lenda popular e documentos jesuítas, teriam sido escondidas pelos padres da Companhia de Jesus nos túneis antes da expulsão da Ordem em 1759. O autor mistura o relato jornalístico sobre as escavações (lideradas pelo Dr. Dutra) e as visitas de autoridades (como Dr. Frontin e o Presidente Rodrigues Alves) com a exploração de um romance gótico-histórico encontrado em um “velho códice”, intitulado D. Garça, que narra uma trágica história de amor, ciúme e vingança entre a condessa italiana Alda de Lambertini (D. Garça), o capitão francês Duclerc e o padre jesuíta João de Jouquières (Marquês de Fressenec), cuja trama sombria se desenrola nos mesmos subterrâneos.</p>', '66834_O-Subterr&acirc;neo-do-Morro-do-Castelo---Lima-Barreto.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/57906_O-Subterrâneo-do-Morro-do-Castelo---Lima-Barreto.pdf', 0, '0', 1, 1),
(117, '7', '52,69,70,46,37', 52, 0, 'O Triste Fim de Policarpo Quaresma', '<p>O Major Policarpo Quaresma representa um patriota fervoroso e meticuloso, cuja paixão inabalável pelo Brasil o leva a adotar comportamentos extravagantes na procura de uma cultura genuinamente brasileira, como aprender a tocar violão e a modinha, além de tentar incorporar tradições tupinambás, como chorar ao receber amigos. Seu fervor patriótico culmina no envio de um requerimento ao Congresso Nacional solicitando que o tupi-guarani seja decretado como língua oficial do país, um ato que o expõe ao ridículo na imprensa, resulta em sua suspensão do trabalho e o leva à internação em um hospício. Depois da aparente recuperação, Quaresma, mesmo abalado pela incompreensão social, direciona seu idealismo para a agricultura no sítio \\\"Sossego\\\". Ele acredita que a dureza do solo brasileiro é a via autêntica para a emancipação e o engrandecimento do país.</p>', '67936_O-Triste-Fim-de-Policarpo-Quaresma---Lima-Barreto.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/89904_O-Triste-Fim-de-Policarpo-Quaresma---Lima-Barreto.pdf', 0, '0', 1, 1),
(118, '6', '69,70,27', 21, 0, 'Poesias dispersas', '<p>Poesias dispersas\\\"de Machado de Assis, é uma vasta coletânea de poemas que abrange temas líricos, cívicos e reflexivos. Liricamente, o volume explora a dor, a saudade, a perda, a desilusão amorosa e a busca pela felicidade, como visto em poemas dedicados à mãe e a diversas figuras femininas (“A PALMEIRA,” “MINHA MÃE,” “A CAROLINA”). Por outro lado, a compilação apresenta obras de natureza patriótica, social e religiosa, discutindo liberdade, opressão e avanço, exemplificando com obras como \\\"HINO PATRIÓTICO\\\", \\\"A CÓLERA DO IMPÉRIO\\\" e \\\"A MORTE NO CALVÁRIO\\\". O escritor também se empenha em sua arte, investigando a inspiração poética e a \\\"missão do poeta\\\" (\\\"MINHA MUSA,\\\" \\\"COGNAC!\\\", \\\"A MISSÃO DO POETA\\\"). Ele também inclui poemas de ocasião, como tributos a personalidades notáveis e acontecimentos históricos.</p>', '24781_Poesias-dispersas---Machado-de-Assis.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/78748_Poesias-dispersas---Machado-de-Assis.pdf', 0, '0', 5, 1),
(119, '7', '56', 8, 0, 'A Terra dos Meninos Pelados', '<p>A narrativa de A Terra dos Meninos Pelados, de Graciliano Ramos, gira em torno de Raimundo, um garoto singular com um olho preto, outro azul e a cabeça nua, o que o faz ser alvo de piadas em sua cidade natal. Na sua solidão, ele viaja para o país imaginário de Tatipirun, um lugar encantado onde todos são calvos e possuem olhos de duas tonalidades. Lá, a natureza é exuberante: o trajeto se aplana, um carro e uma laranjeira dialogam, e o rio das Sete Cabeças se fecha para permitir sua passagem. Raimundo é bem-vindo entre os \"meninos nus\" como Pirenco, Talima, Fringo, um anãozinho e a \"princesa\" Caralâmpia. Ele se fascina com um mundo de perpétua serenidade, sem noite ou chuva, onde as crianças dormem fechando apenas um olho. Embora seja um lugar ideal e receptivo, Raimundo opta por retornar à sua terra natal, impulsionado pela necessidade de \"concluir a lição de geografia\". Ele se despede com a promessa de voltar e a convicção de que a vivência em Tatipirun o auxiliou a compreender melhor as diferenças do seu universo.</p>', '7008_A-Terra-dos-Meninos-Pelados---Graciliano-Ramos.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/67662_A-Terra-dos-Meninos-Pelados---Graciliano-Ramos.pdf', 0, '0', 1, 1),
(120, '7', '53,24', 13, 0, 'Mattos, Malta ou Matta?', '<p>O livro descreve a jornada de um personagem anônimo, que se identifica como um marido traído e funcionário público. Ele envia uma sequência de cartas a um periódico para relatar sua caçada ao suposto amante de sua esposa, Margarida, o misterioso \"João Alves Castro Matta\". A jornada, cheia de surpresas, inclui uma francesa perversa chamada Jeannite, resulta na detenção errônea de sua sogra, Dona Leonarda dos Prazeres, em vez de Margarida, e termina com a descoberta de um \"ressuscitado\", um filósofo boêmio chamado João Alberto, que, para escapar de complicações, se disfarça e veste as roupas de Castro Malta (o amante de Margarida), que acaba falecendo na Casa de Misericórdia. No desfecho, quando o narrador tenta desvendar toda a teia de confusões e trocas de identidade com o jornalista Quintino, do jornal O PaiZ, este o desmascara, revelando que o “marido” é, na verdade, um romancista que inventou toda a história, incluindo sua família e as perseguições, usando um escândalo público já existente como tema para sua novela.</p>', '70115_Mattos,-Malta-ou-Matta----Alu&iacute;sio-de-Azevedo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/87195_Mattos,-Malta-ou-Matta----Aluísio-de-Azevedo.pdf', 0, '0', 0, 1),
(121, '7', '53,24', 13, 0, 'O esqueleto', '<p>O esqueleto de Aluísio Azevedo, é um drama romântico situado no Rio de Janeiro antes da Independência, centrado em Ângelo Pallingrini, conhecido como \"Satanás\", o mestre de armas de D. Pedro, e sua procura por vingança. A tragédia começa quando D. Pedro desonra a filha pura de Satanás, Branca, desencadeando o suicídio do amante dela, Paulo de Andrade, e o assassinato de sua guardiã por Satanás, levando Branca à loucura. Em meio à aclamação de D. Pedro pela Independência, Satanás, após um combate interrompido, abandona Branca, que acaba falecendo em seus braços. Então, o escultor esculpiu uma estátua de sua filha antes de deixar o Brasil, prometendo vingança, enquanto o covarde D. Bias, que a havia aprisionado, conclui simbolicamente o enigma do título ao ocultar um esqueleto no armário do Paço.</p>', '44888_O-esqueleto---Alu&iacute;sio-Azevedo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/34865_O-esqueleto---Aluísio-Azevedo.pdf', 0, '0', 0, 1),
(122, '7', '53,40,24,41,37', 13, 0, 'O Homem', '<p>O livro descreve o declínio físico e psicológico de Madalena (Magdá), uma jovem aristocrata do Rio de Janeiro do século XIX, que volta da Europa em um estado de melancolia e nervosismo. O motivo de sua angústia é a descoberta feita por seu pai, o Conselheiro Pinto Marques, de que seu amor de infância e futuro marido, Fernando, é, na realidade, seu meio-irmão. Magdá reage ao amor proibido com crises de histeria, que se agravam após a partida e morte de Fernando. Seu pai, aconselhado pelo brutal Dr. Lobão, tenta casá-la com vários pretendentes (Martinho de Azevedo, Comendador José Furtado, Dr. Tolentino, Conde do Valado), mas ela os rejeita.</p><p><strong>Classificação Indicativa: </strong>Não recomendado para menores de 16 anos.</p>', '7585_O-Homem---Alu&iacute;sio-Azevedo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/21017_O-Homem---Aluísio-Azevedo.pdf', 0, '0', 3, 1),
(123, '7', '69,47', 55, 0, 'Maldita Parentela', '<p>A comédia de um ato Maldita Parentela de França Júnior se passa em um luxuoso baile no Rio de Janeiro de 1871, onde Damião Teixeira tenta, desesperadamente, arranjar o casamento de sua filha Marianinha com o rico e inculto negociante Joaquim Guimarães, buscando prestígio social. O plano de Damião é frequentemente sabotado e ridicularizado pela sua \\\"maldita família\\\" - composta por personagens como o Major Basílio, suas filhas extravagantes e o atrapalhado primo Vilasboas - que, com suas maneiras do interior, o envergonham perante a elite carioca. Contudo, Marianinha nutre um amor pelo pobre Doutor Aurélio. O enredo se resolve quando o Major Basílio, em uma revelação dramática, descobre ser o pai biológico de Aurélio, dando ao jovem médico a família e a posição que Damião exigia. Ao mesmo tempo, Guimarães desiste de Marianinha (que o rejeita) e, após ser desafiado a um duelo pelo irmão de Hermenegilda, decide se casar com ela para resolver o escândalo. Derrotado em seus objetivos e exausto com o caos provocado pelos seus parentes, Damião é forçado a dar sua bênção ao casamento de Marianinha com Aurélio.</p>', '69009_Maldita-Parentela---Fran&ccedil;a-J&uacute;nior.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/56918_Maldita-Parentela---França-Júnior.pdf', 0, '0', 1, 1),
(124, '7', '69,47', 55, 0, 'A lota&ccedil;&atilde;o do bondes', '<p>\\\\\\\\\\\\\\\"A lotação dos bondes\\\\\\\\\\\\\\\", uma comédia de um ato, ocorre no Hotel de Londres, onde a norma de \\\\\\\\\\\\\\\"lotação\\\\\\\\\\\\\\\" dos bondes separa Elvira Martins, seu pai Ramiro Martins, Josefa Pimenta e Joaquim Pimenta. Elvira e Josefa se encontram com Camilo Correa, um pretendente de Elvira, que aproveita a ocasião para se declarar e convidá-la para se casar. A situação se complica com a chegada de Ramiro e Pimenta, que já haviam se confrontado na rua após Ramiro dar um soco em Pimenta na confusão do bonde. Pimenta, ao ver Camilo com Josefa, acusa-o de ser o sedutor de sua esposa. O mal-entendido é resolvido quando Elvira esclarece que Camilo é seu namorado de boas intenções, e Ramiro, contente com a proposta, aprova o noivado, celebrando a \\\\\\\\\\\\\\\"bendita lotação\\\\\\\\\\\\\\\" que uniu o casal.</p>', '88935_A-lota&ccedil;&atilde;o-do-bondes---Fran&ccedil;a-Junior.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/19231_A-lotação-do-bondes---França-Junior.pdf', 0, '0', 1, 1),
(125, '7', '69,47', 55, 0, 'Amor com amor se paga', '<p>A comédia “Amor com amor se paga” gira em torno de uma noite de traições “platônicas” cruzadas: Miguel Carneiro, fugindo da polícia após um encontro com Emília Coutinho (esposa de Eduardo), esconde-se na casa de Eduardo Coutinho. Miguel se esconde debaixo de uma mesa e, ali, descobre que Eduardo está recebendo sua esposa, Adelaide Carneiro. Mais tarde, Emília, preocupada, entra na mesma casa. O caos se resolve quando Miguel se revela e expõe o flagrante mútuo a Eduardo: enquanto Eduardo cortejava Adelaide, Miguel estava com Emília. O final é irônico, com os casais se perdoando e atribuindo suas leviandades ao “puro platonismo”, concluindo que \\\\\\\"Amor com amor se paga”.</p>', '98889_Amor-com-amor-se-paga---Fran&ccedil;a-J&uacute;nior.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/54427_Amor-com-amor-se-paga---França-Júnior.pdf', 0, '0', 0, 1),
(126, '7', '69,47', 55, 0, 'Como se fazia um deputado', '<p>A comédia \\\\\\\\\\\\\\\"Como se fazia um deputado\\\\\\\\\\\\\\\", de autoria de França Júnior, faz uma sátira da corrupção eleitoral e dos matrimônios arranjados no Brasil Imperial. A trama une os interesses do Major Limoeiro (dinheiro) e do Tenente-Coronel Chico Bento (influência), com o objetivo de eleger Henrique, sobrinho de Limoeiro, como deputado provincial. A aliança é selada pelo casamento arranjado de Henrique com Rosinha, garantindo que o poder permaneça na família sob a bandeira da \\\\\\\\\\\\\\\"Senhora Dona Conveniência\\\\\\\\\\\\\\\", independentemente do partido no poder. A votação se transforma em um tumulto de fraude e violência, onde o escravo Domingos e o mascate italiano Pascoal Basilicata são utilizados para votar várias vezes. Apesar de Henrique se revoltar inicialmente contra a imoralidade política e desejar deixar a carreira, ele é convencido por Rosinha - impulsionada pela vaidade de ser \\\\\\\\\\\\\\\"esposa de deputado\\\\\\\\\\\\\\\" na Corte - a aceitar o cargo. A peça se encerra com a celebração da vitória de Henrique e a concessão da carta de alforria a Domingos por seus serviços eleitorais.</p>', '23853_Como-se-fazia-um-deputado---Fran&ccedil;a-J&uacute;nior.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/41411_Como-se-fazia-um-deputado---França-Júnior.pdf', 0, '0', 1, 1),
(127, '7', '69,47', 55, 0, 'Dois proveitos em um saco', '<p>Em “Dois proveitos em um saco”, de França Júnior, Amélia Teixeira, infeliz por ter que passar os invernos em Petrópolis devido às “cólicas de fígado” do marido Luís Teixeira, planeja uma mudança para a corte (Rio de Janeiro). Ela usa o jogo da *Philippina* (uma aposta feita sobre amêndoas unidas) e, para garantir a vitória, ludibria Boaventura Fortuna da Anunciação, um solteiro excêntrico que invadiu sua casa em busca de pousada, fazendo-o se apaixonar. Quando Luís aparece, Amélia tranca Boaventura num quarto e simula que ele é um \\\"sedutor\\\" que ela confinou. Ela então passa a chave do quarto para o marido como o primeiro item do jogo; Luís, ao recebê-la sem pronunciar a frase de defesa \\\"J\\\'y pense\\\", perde a aposta, sendo obrigado a cumprir a exigência de levar Amélia à corte todos os invernos. Por fim, Amélia liberta Boaventura e se orgulha de ter ludibriado dois homens: o esposo, para vencer a aposta, e Boaventura, ao utilizá-lo como o \\\"sedutor\\\".</p>', '70001_Dois-proveitos-em-um-saco---Fran&ccedil;a-J&uacute;nior.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/94354_Dois-proveitos-em-um-saco---França-Júnior.pdf', 0, '0', 0, 1),
(128, '7', '69,47', 55, 0, 'Entrei para o Clube J&aacute;come', '<p>A comédia de França Júnior, \\\"Entrei Para o Clube Jácome\\\", mostra Julião da Cunha, um homem obcecado por cavalos e pelo Clube Jácome, para desespero de sua família. Quando Ernesto pede a mão de sua filha, Chiquinha, Julião exige que ele se torne sócio do clube. Embora Ernesto deteste cavalos e seja inexperiente (chegando a simular uma cavalgada em cadeiras com Julião), ele cede por amor e retorna com o diploma de sócio. A peça culmina numa celebração caótica, em que Julião, Ernesto, Chiquinha, o criado, e membros do Clube pulam e gritam \\\"Up, up, up\\\", levando o Comendador Anastácio a crer que todos enlouqueceram.</p>', '46964_Entrei-Para-o-Clube-J&aacute;come----Fran&ccedil;a-J&uacute;nior.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/52895_Entrei-Para-o-Clube-Jácome----França-Júnior.pdf', 0, '0', 1, 1),
(129, '7', '69,47', 55, 0, 'Meia Hora de Cinismo', '<p>A comédia Meia Hora de Cinismo, de autoria de França Júnior, retrata o dia a dia despreocupado de alunos de Direito em São Paulo no século XIX. O foco está no embate entre o recém-chegado Trindade, que se sente ofendido pelos trotes dos veteranos, e o grupo composto por Nogueira, Neves, Macedo e Frederico, cujas interações são caracterizadas pelo uso de gírias acadêmicas e o costume de \\\"rabequear\\\" (difamar a vida dos outros). O desfecho da história ocorre quando o comerciante Jacó tenta cobrar uma dívida de 300$000 réis de Macedo. Isso provoca inicialmente risadas dos jovens, mas culmina em um ato de solidariedade quando Nogueira fornece o montante para preservar a reputação de Macedo perante a lei.</p>', '94014_Meia-Hora-de-Cinismo---Fran&ccedil;a-J&uacute;nior.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/51049_Meia-Hora-de-Cinismo---França-Júnior.pdf', 0, '0', 3, 1),
(130, '7', '54,47', 55, 0, 'O Defeito de Família', '<p>A comédia em um ato de França Júnior, ambientada no Rio de Janeiro, narra a confusão gerada por Josefina, que tenta esconder de seu noivo, Artur, um \"defeito de família\": um joanete. Com o apoio secreto de sua mãe, ela recebe visitas escondidas do pedicuro André Barata, levantando as suspeitas do criado alemão Ruprecht e culmina em uma série de mal-entendidos e ciúmes por parte de Artur e de seu pai, Matias. O conflito se resolve quando a verdade sobre o tratamento médico é revelada, levando a família a concluir, em tom jocoso, que defeitos físicos hereditários devem ser mantidos em sigilo.</p>', '61881_O-Defeito-de-Fam&iacute;lia---Fran&ccedil;a-J&uacute;nior.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/18168_O-Defeito-de-Família---França-Júnior.pdf', 0, '0', 0, 1),
(131, '7', '64,49', 25, 0, 'O pr&iacute;ncipe sapo', '<p>O conto descreve a aventura de uma jovem e bela princesa que, após perder sua bola de ouro em um poço, faz um voto a um sapo feio para que a encontre: ele se tornaria seu amigo, comendo em seu prato e dormindo em sua cama. Com relutância e medo, a princesa é obrigada pelo monarca a honrar seu compromisso quando um sapo surge no castelo para solicitar o acordo. No quarto, a princesa, farta do sapo, atira-o contra a parede, quebrando o feitiço de uma bruxa má. O sapo se transforma em um encantador príncipe, e eles embarcam juntos numa carruagem para o seu reino, com a companhia do leal criado Henrique. Durante a jornada, as ataduras de ferro em torno do coração se desfazem em alegria, comemorando a libertação de seu senhor.</p>', '86049_O-pr&iacute;ncipe-sapo---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/71552_O-príncipe-sapo---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(132, '7', '49', 25, 0, 'O bom negócio', '<p>\"O bom negócio\" conta a história de um agricultor inocente que, após a venda de sua vaca, desperdiça o dinheiro em um lago devido a um desentendimento com sapos. Posteriormente, perde a carne de uma segunda vaca ao entregá-la a um cão. Ao buscar o rei para expressar suas queixas acerca dos danos, consegue provocar a risada da filha do soberano pela primeira vez e, como recompensa, são-lhe oferecidos quinhentos táleres. O camuflado rei engana um soldado e um judeu, que são punidos com chicotadas em seu lugar. Encantado, o monarca autoriza que o camuflado seja executado. Leve consigo a quantia que tenha capacidade de transportar do tesouro real, e ele ainda consegue ludibriar o judeu mais uma vez, a fim de ficar com seu casaco, finalizando a narrativa de forma próspera e triunfante.</p>', '59041_O-bom-neg&oacute;cio---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/39725_O-bom-negócio---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(133, '7', '64,49', 25, 0, 'Os três homenzinhos da floresta', '<p>O conto descreve a disputa entre uma enteada generosa e a filha feia de sua madrasta invejosa. A primeira, ao coletar morangos no inverno, é agraciada com três rapazes bonitos, moedas de ouro e um casamento com um rei, graças à sua generosidade. A segunda, por sua agressividade, é condenada a expulsar sapos a cada palavra.</p>', '11841_Os-tr&ecirc;s-homenzinhos-da-floresta---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/63240_Os-três-homenzinhos-da-floresta---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(134, '7', '64,49', 25, 0, 'As tr&ecirc;s folhas da serpente', '<p>Um jovem humilde, após se destacar na guerra, casa-se com a princesa, prometendo ser sepultado vivo com ela se morresse. Ao ser trancado na cripta após a morte dela, ele descobre e usa três folhas mágicas de serpente para ressuscitá-la. No entanto, a esposa ressurgida perde o amor e tenta assassiná-lo no mar com um capitão. Uma criada fiel salva o rei com as mesmas folhas e revela o crime. O pai da princesa, chocado com a traição, condena a filha e o cúmplice à morte.</p>', '83479_As-tr&ecirc;s-folhas-da-serpente---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/47744_As-três-folhas-da-serpente---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(135, '7', '64,49', 25, 0, 'O casamento da dona raposa', '<p>O conto “O casamento da dona raposa” é apresentado em duas histórias que giram em torno da Senhora Raposa e sua busca por um novo marido. Na primeira versão, o velho Senhor Raposo, desconfiado da infidelidade da esposa, finge-se de morto. A Senhora Raposa rejeita sucessivos pretendentes até aceitar um que, assim como seu marido, possuía nove rabos; no entanto, o velho Raposo salta do seu esconderijo debaixo do banco, bate no rival e expulsa a esposa traidora e os convidados. Na segunda história, o velho Raposo está morto, e a Senhora Raposa rejeita uma série de pretendentes, incluindo o lobo e outros animais, pois nenhum possuía as características específicas que ela procurava (meias vermelhas e boca pontuda). Por fim, ela aceita e se casa com um jovem raposo que preenche os requisitos e, feliz, manda a criada gata jogar o corpo do ex-marido pela janela para celebrar a união.</p>', '22067_O-casamento-da-dona-raposa---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/71857_O-casamento-da-dona-raposa---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(136, '7', '57,24', 56, 0, 'Amar, verbo intransitivo', '<p>A história segue a chegada de Fräulein Elza, uma governanta alemã contratada pela rica família paulista Sousa Costa, com a intenção oculta de servir como tutora do jovem Carlos, de 15 anos, evitando que ele contraia vícios ou doenças venéreas ao buscar a iniciação sexual fora de casa. Apesar da primeira reação negativa de Dona Laura ao descobrir a verdade, a família permite a continuação de Elza, que avança com cuidado na construção do caráter e da sexualidade do jovem. A relação entre Carlos e Elza progride da tensão intelectual para a intimidade física, permeada por conflitos internos de Elza entre seu ideal de amor incondicional e sua missão prática. Isso culmina na consumação secreta, que assegura o \"repouso\" dos pais e o desenvolvimento de Carlos como homem.</p>', '11665_Amar,-verbo-intransitivo---M&aacute;rio-de-Andrade.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/67863_Amar,-verbo-intransitivo---Mário-de-Andrade.pdf', 0, '0', 0, 1),
(137, '10', '57', 56, 0, 'A costela do Grão Cão', '<p>A costela do Grão Cão é uma coletânea de poemas de Mário de Andrade, escritos entre 1924 e 1940, que aborda temas centrais de angústia existencial, desejo intenso e profunda solidão. O eu poético vagueia pela cidade numa procura desesperada por amor, enfrentando a decepção e a crueldade humana, enquanto se depara com a imagem do seu eu infantil (“Reconhecimento de Nêmesis”), que o impede de se acomodar. A obra também inclui reflexões metalinguísticas sobre a autenticidade da escrita brasileira e expressa o amor como uma força caótica e, por vezes, violenta (“Grã cão do outubro”), culminando em um sentimento de exaustão e resignação à sua condição de isolamento.</p>', '20130_A-costela-do-Gr&atilde;o-C&atilde;o---M&aacute;rio-de-Andrade.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/62717_A-costela-do-Grão-Cão---Mário-de-Andrade.pdf', 0, '0', 0, 1),
(138, '7', '57,47', 56, 0, 'Café', '<p><em>Café</em>, de Mário de Andrade, é uma tragédia em três atos que dramatiza a crise do café e a consequente revolta social em São Paulo, entre 1933 e 1942. O drama começa com a fome e o desespero dos estivadores no porto parado e dos colonos nas fazendas, todos vítimas da ambição da elite (“gigantes da mina do ouro”) que manipula o comércio e queima o café, privando o povo do pão e da dignidade. Após uma cena de sátira da ineficácia política na Câmara dos Deputados e o doloroso êxodo dos trabalhadores, a peça culmina no “Dia Novo,” uma revolução violenta em que o povo oprimido se levanta e alcança a vitória sobre as forças governistas e a oligarquia, terminando com a Mãe a entoar um hino de força, amor, trabalho e paz.</p>', '47456_Caf&eacute;---M&aacute;rio-de-Andrade.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/433_Café---Mário-de-Andrade.pdf', 0, '0', 0, 1),
(139, '6', '57,37', 56, 0, 'Liras Paulistanas', '<p>Liras Paulistanas, de Mário de Andrade, oferece um retrato crítico e visceral da cidade de São Paulo, dividido em duas partes principais: “Lira Paulistana” e “A meditação sobre o Tietê”. A primeira parte estabelece um forte contraste entre a euforia noturna da metrópole e a realidade de miséria e cansaço da manhã, questionando o progresso e a moral da cidade e exemplificando a desilusão do trabalhador na “triste história de Pedro”. A segunda parte usa o Rio Tietê, que flui para dentro da terra, como metáfora para a “Demagogia” e a corrupção social; o eu lírico imerge voluntariamente nessas águas “pesadas e oliosas” do sofrimento humano na esperança de purificação, encontrando a derrota pessoal, mas reafirmando a indestrutível grandeza do ser humano.</p>', '1202_Lira-Paulistana---M&aacute;rio-de-Andrade.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/99817_Liras-Paulistanas---Mário-de-Andrade.pdf', 0, '0', 0, 1),
(140, '10', '57', 56, 0, 'Livro azul', '<p>O Livro azul, de Mário de Andrade, é uma coletânea de poemas que se divide em três partes: \"RITO DO IRMÃO PEQUENO\", \"GIRASSOL DA MADRUGADA\" e \"O GRIFO DA MORTE\". A obra utiliza uma intensa imagética brasileira para explorar a dualidade entre a pureza da infância (o \"irmão pequeno\") e a decadência da experiência adulta, contrastando a natureza com a ameaça da modernização. Os poemas navegam por temas de amor noturno e contemplativo como refúgio das ambições diurnas, o cumprimento do destino através da dor, e, por fim, a reflexão sobre uma \"grave Melancolia\" que proclama a Morte como uma benfeitora.</p>', '58209_Livro-azul---M&aacute;rio-de-Andrade.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/33076_Livro-azul---Mário-de-Andrade.pdf', 0, '0', 0, 1),
(141, '7', '57', 56, 0, 'Macunaíma: o herói sem nenhum caráter', '<p>Macunaíma é o “herói sem nenhum caráter” que nasce preto e preguiçoso no mato-virgem, passando por uma transformação mágica que o faz crescer, embora mantenha a mentalidade infantil. Após a morte de sua amante Ci, que lhe deixa a muiraquitã (um amuleto), ele descobre que a joia foi roubada pelo gigante Piaimã (Venceslau Pietro Pietra), um colecionador que vive em São Paulo. Na sua procura, Macunaíma se branqueia ao tomar banho numa fonte encantada e parte para a metrópole, onde confronta a modernidade e o gigante com artifícios e magia, como se passar por francesa e invocar Exu numa macumba para torturá-lo à distância. Tudo isso em uma viagem caracterizada pela preguiça e pela ausência de ética.</p>', '40924_Macuna&iacute;ma-o-her&oacute;i-sem-nenhum-car&aacute;ter---M&aacute;rio-de-Andrade.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/38111_Macunaíma-o-herói-sem-nenhum-caráter---Mário-de-Andrade.pdf', 0, '0', 1, 1),
(142, '7', '49,57', 56, 0, 'Contos novos', '<p>A seleção de contos de Mário de Andrade explora relações humanas intensas e tensões sociais latentes. As narrativas abrangem desde o amor complexo e duradouro do narrador Juca por Maria, que o leva à auto-superação (Vestida de Preto), até a amizade íntima e psicologicamente carregada entre Juca e Frederico Paciência, marcada por conflito e descoberta sexual (Frederico Paciência). Outras histórias abordam frustrações emocionais e sociais, como a falha do jovem carregador “o 35” em celebrar o idealizado Primeiro de maio ou a angústia sexual de Mademoiselle, uma governanta reprimida, cujas fantasias culminam em um susto atrás da igreja (Atrás da Catedral de Ruão). A dinâmica de poder entre classes é retratada na teimosia autoritária do fazendeiro Joaquim Prestes, que exige que seus empregados sequem um poço para encontrar sua caneta-tinteiro (O Poço). O cotidiano também se torna épico, seja na perseguição noturna e infrutífera a um ladrão que une a vizinhança (O Ladrão), ou na decisão do narrador de celebrar o Natal com um peru, um ato de “loucura” que restabelece a genuína felicidade de sua família enlutada (O Peru de Natal).</p>', '55258_Contos-novos---M&aacute;rio-de-Andrade.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/39045_Contos-novos---Mário-de-Andrade.pdf', 0, '0', 0, 1),
(143, '9,8', '57', 56, 0, 'Será o Benedito!', '<p>\"Será o Benedito!\", uma coletânea de crônicas e ensaios de Mário de Andrade, trata de vários tópicos da arte e cultura do Brasil. O escritor aborda o pioneirismo do Congresso de Língua Nacional Cantada e a relevância da conservação do patrimônio histórico pelo SPHAN, apresentando detalhes de restaurações realizadas na capital paulista. A obra apresenta críticas e elogios a artistas contemporâneos, incluindo as novas obras monumentais de Cândido Portinari, a pintura de Ruben Cassa, Aldary Toledo e Enrico Bianco, o balé nacional de Eros Volúsia e a arte da fotomontagem de Jorge de Lima. Além da crítica artística e cultural, o livro contém a crônica principal, na qual o narrador relata o seu comovente e trágico encontro com o negrinho Benedito no sertão, que sonhava em ir para a cidade, e cujo falecimento repentino inspira a exclamação que dá nome à obra.</p>', '69562_Ser&aacute;-o-Benedito!---M&aacute;rio-de-Andrade.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/5667_Será-o-Benedito!---Mário-de-Andrade.pdf', 0, '0', 0, 1),
(144, '7,12', '67,65,66,24', 57, 0, 'Viagem ao Centro da Terra', '<p>O professor Otto Lidenbrock, um mineralogista impaciente e excêntrico, descobre um criptograma rúnico escondido em um manuscrito islandês, que revela as instruções de Arne Saknussemm para chegar ao centro da Terra através da cratera do vulcão Sneffels, na Islândia. Ignorando as objeções científicas de seu sobrinho, Axel, sobre o calor interno do planeta, o professor inicia imediatamente a expedição. Após uma viagem de Hamburgo à Islândia, eles contratam o guia Hans Bjelke e escalam o Sneffels, sobrevivendo a uma tempestade de poeira e descendo a cratera. No dia 28 de junho, eles utilizam a sombra do pico Scartaris para localizar a chaminé correta para a descida e, munidos de cordas e lâmpadas elétricas, iniciam a jornada, descendo um poço vertical de quase três mil pés até alcançarem um corredor de lava no nível do mar, por onde prosseguem para as entranhas do globo.</p>', '51598_Viagem-ao-Centro-da-Terra---J&uacute;lio-Verne.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/48536_Viagem-ao-Centro-da-Terra---Júlio-Verne.pdf', 0, '0', 2, 1),
(145, '7,14', '64,49,66,63', 58, 0, 'A pequena sereia', '<p>A Pequena Sereia, a mais nova e pensativa das seis filhas do Rei do Mar, vive no fundo do oceano, mas sonha com o mundo da superfície, pelo qual ganha permissão de visitar aos quinze anos. Ela se encanta por um jovem príncipe humano, cuja vida ela resgatou durante um naufrágio. Apesar de seu desejo por uma alma imortal, que as sereias não possuem, e pelo amor do príncipe, ela faz um pacto aterrador com a Bruxa do Mar, trocando sua voz encantadora por um par de pernas. Ela está ciente de que cada passo será uma tortura e que, caso o príncipe se case com outra, se tornará espuma do oceano. Oferecida uma chance de matar o príncipe para reverter o feitiço, ela se recusa a causar mal e, em vez disso, atira-se ao mar, transformando-se em uma Filha do Ar, ganhando a oportunidade de conquistar uma alma imortal através de trezentos anos de boas ações.</p>', '69501_A-pequena-sereia---Hans-Christian-Andersen.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/46791_A-pequena-sereia---Hans-Christian-Andersen.pdf', 0, '0', 6, 1),
(146, '7,14', '49', 58, 0, 'O Patinho Feio', '<p>O conto \\\"O Patinho Feio\\\", escrito por Hans Christian Andersen, conta a história de um filhote que, por ser maior e distinto dos demais, é rejeitado e constantemente maltratado por sua família, pelos outros patos e pelas aves da propriedade rural. Ele é desconsiderado e enfrenta várias dificuldades e dores, como a solidão no pântano, o risco dos caçadores e o rigoroso inverno. Na primavera, sentindo suas asas fortes, ele voa para um jardim onde encontra um grupo de majestosos cisnes. Ao se aproximar e curvar a cabeça para a água, ele vê seu reflexo e descobre a verdade: ele nunca foi um pato feio, mas sim um lindo e gracioso cisne. Finalmente apreciado e apreciado pelos outros cisnes e pelas crianças, ele descobre a alegria com a qual nunca havia sonhado antes.</p>', '7399_O-Patinho-Feio---Hans-Christian-Andersen.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/69944_O-Patinho-Feio---Hans-Christian-Andersen.pdf', 0, '0', 6, 1),
(147, '7,14', '49', 58, 0, 'A roupa nova do imperador', '<p>O conto “A roupa nova do imperador” conta a trajetória de um monarca extremamente vaidoso, cuja única aflição era mostrar suas roupas novas. Dois fraudadores se valem dessa vaidade, afirmando possuir a habilidade de criar um tecido mágico que seria invisível para qualquer indivíduo ingênuo ou despreparado para o seu posto. Para não serem considerados ineptos, o imperador e todos os seus cortesãos fingem admirar o “traje” que, na verdade, não existe, permitindo que os trapaceiros continuem a extorquir dinheiro. O clímax acontece quando o imperador desfila em uma grande procissão, ostentando suas roupas invisíveis, sendo elogiado pela multidão até que uma criança inocente expõe a verdade: “Mas ele não está usando nada.” Apesar de perceber o engano, o imperador é forçado a manter a dignidade e continua o desfile, confirmando a fraude.</p>', '41022_A-roupa-nova-do-imperador---Hans-Christian-Andersen.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/79168_A-roupa-nova-do-imperador---Hans-Christian-Andersen.pdf', 0, '0', 24, 1),
(148, '7,14', '49,68', 58, 0, 'A princesa e a ervilha', '<p>O príncipe, desejando uma princesa de verdade, voltou para casa frustrado após viajar sem sucesso, mas uma noite, uma princesa encharcada pela tempestade bateu à porta. Para testá-la, a rainha escondeu uma ervilha sob vinte travesseiros e vinte edredons. Na manhã seguinte, a moça reclamou de ter dormido muito mal devido a algo duro que a deixou marcada. Sua extrema sensibilidade provou que era uma princesa autêntica, então o príncipe se casou com ela.</p>', '47821_A-princesa-e-a-ervilha---Hans-Christian-Andersen.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/94799_A-princesa-e-a-ervilha---Hans-Christian-Andersen.pdf', 0, '0', 8, 1),
(149, '7,14', '49,68', 58, 0, 'O soldadinho de chumbo', '<p>O conto descreve a trajetória de um soldado de chumbo de uma perna só, que se encanta por uma bailarina de papel que ele acredita ser parecida com ele. Após ser amaldiçoado por um feiticeiro de uma caixa de rapé, ele cai da janela e embarca numa perigosa viagem de barco de papel por um regato, enfrentando a escuridão de um cano e sendo engolido por um grande peixe. Milagrosamente, o peixe é pescado e o soldadinho é devolvido à mesa da sala, onde reencontra a bailarina. No final, o soldadinho é atirado ao fogão por um menino e a bailarina é levada pelo vento para junto dele, onde ambos se derretem juntos, restando apenas um pequeno coração de chumbo e a fivela azul enegrecida da dançarina.</p>', '92205_O-soldadinho-de-chumbo---Hans-Christian-Andersen.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/43655_O-soldadinho-de-chumbo---Hans-Christian-Andersen.pdf', 1, '5', 31, 1),
(150, '7,12', '67,33,66', 59, 0, 'Alice no País das Maravilhas', '<p>Alice, entediada em um jardim, segue um Coelho Branco que consulta um relógio de colete e cai em uma toca profunda, chegando a uma sala com uma portinha trancada para um lindo jardim. Para tentar superar, ela consome um líquido e come um doce que a transformam de forma drástica, diminuindo a um centímetro e aumentando para mais de três metros de altura. Isso gera um lago de lágrimas com o seu choro. Após se secar numa \"corrida inusitada\" com um Rato, um Pato e outros animais, ela é confundida com a empregada do Coelho Branco e é novamente aprisionada, devido ao seu crescimento excessivo dentro da residência dele. Alice consegue diminuir de tamanho ao comer um biscoito-pedra, escapa para a floresta e decide que deve voltar ao seu tamanho normal para, finalmente, entrar no jardim encantador.</p>', '8498_Alice-no-Pa&iacute;s-das-Maravilhas---Lewis-Carroll.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/94026_Alice-no-País-das-Maravilhas---Lewis-Carroll.pdf', 0, '0', 18, 1),
(151, '7,12', '67,66', 59, 0, 'Alice através do Espelho', '<p>Alice através do Espelho narra a jornada de Alice após atravessar o espelho de sua sala, onde o mundo é invertido e organizado como um tabuleiro de xadrez gigante. Assumindo o papel de um peão, ela se propõe a alcançar a oitava casa para se tornar uma Rainha. Em sua aventura onírica, ela interage com figuras excêntricas como a autoritária Rainha Negra, a esquecida Rainha Branca (que vive para trás), os irmãos Tweedledum e Tweedledee, Humpty Dumpty e o desastrado Cavaleiro Branco. Após finalmente cruzar o último riacho e ser coroada Rainha, o banquete de celebração se torna um caos, fazendo Alice despertar em sua poltrona, concluindo que toda a experiência foi um sonho.</p>', '18308_Alice-atrav&eacute;s-do-Espelho---Lewis-Carroll.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/95219_Alice-através-do-Espelho---Lewis-Carroll.pdf', 0, '0', 5, 1),
(152, '7', '64,49', 25, 0, 'A Gata Borralheira', '<p>A Gata Borralheira, obra dos Irmãos Grimm, narra a saga de uma moça que, após o falecimento da mãe, é obrigada a viver como serva e sofre abusos por parte da madrasta e das meias-irmãs, que a apelidam de Cinderella por dormir ao lado das cinzas. Com a ajuda de um pássaro em um pé de avelã no túmulo da mãe, ela recebe vestidos para ir a um baile de três dias dado pelo príncipe, dançando com ele e fugindo todas as noites. Na terceira noite, ela perde um sapato de ouro em uma escada com piche. O príncipe utiliza o sapato para encontrar sua futura esposa; as irmãs tentam calce-lo mutilando os pés, porém são descobertas por dois pombos. Cinderella é finalmente encontrada, casa-se com o príncipe, e suas irmãs maldosas são punidas com a cegueira pelos pombos no dia do casamento.</p>', '40143_A-Gata-Borralheira---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/15599_A-Gata-Borralheira---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(153, '7', '64,49', 25, 0, 'Os sete corvos', '<p>Um pai, aborrecido pelo atraso dos seus sete filhos que buscavam água para o batismo da sua filha recém-nascida e enferma, lançou uma maldição sobre eles, convertendo-os em sete corvos. Anos mais tarde, a irmã, agora mais velha e consciente do azar, embarcou numa longa e arriscada viagem para libertá-los. Depois de superar obstáculos e entrar na Montanha de Vidro utilizando seu dedo como chave, ela deixou o anel de seus pais cair no copo do sétimo corvo. Ao reconhecer o anel e desejar que a irmã estivesse ali para libertá-los, a maldição foi desfeita, e os sete irmãos, recuperando a forma humana, puderam voltar para casa com alegria.</p>', '80250_Os-sete-corvos---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/9323_Os-sete-corvos---Irmãos-Grimm.pdf', 0, '0', 1, 1),
(154, '7', '64,49', 25, 0, 'Os elfos', '<p>“Os elfos” dos Irmãos Grimm reúne três contos curtos sobre a interação entre humanos e essas criaturas mágicas. A narrativa inicial conta a história de um sapateiro de baixa renda que enriquece graças ao auxílio de dois elfos que trabalham à noite, deixando-os após ganharem novas roupas como recompensa. Na segunda, uma criada serve de madrinha para um bebê elfo, mas o que ela pensa ter sido uma estadia de três dias revela-se ter sido sete anos ao retornar para casa. Finalmente, a terceira narrativa retrata a recuperação de um bebê em que foi trocado. A mãe seguiu o conselho de fazê-lo rir, o que leva os elfos a reverterem a troca.</p>', '16425_Os-elfos---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/30867_Os-elfos---Irmãos-Grimm.pdf', 0, '0', 1, 1),
(155, '7', '64,49', 25, 0, 'O pequeno polegar', '<p>O conto “O pequeno polegar”, escrito pelos Irmãos Grimm, conta a história de um garoto muito inteligente que nasceu com o tamanho de um polegar, filho de um aldeão de baixa renda e sua esposa, que o amam intensamente. Sua inteligência é rapidamente demonstrada quando ele consegue levar a carroça do pai para a floresta, guiando o cavalo de dentro de sua orelha, um feito que leva seu pai a vendê-lo a dois estranhos que pretendiam exibi-lo por dinheiro. No entanto, Pequeno Polegar consegue se evadir dos homens e, mais tarde, impede o roubo de dois ladrões na casa de um pastor, gritando para atrair a atenção. Depois de se refugiar no celeiro, ele é devorado por uma vaca ao ser transportado com o feno que ela consome.</p>', '41152_O-pequeno-polegar---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/51919_O-pequeno-polegar---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(156, '7', '64,49', 25, 0, 'Branca de Neve e Rosa Vermelha', '<p>O conto Branca de Neve e Rosa Vermelha narra a vida de duas irmãs bondosas de personalidades distintas que moravam com sua mãe em uma cabana. Certa noite de inverno, elas acolhem um urso negro, que se torna um amigo querido e as visita regularmente. Na primavera, o urso se afasta para proteger seus tesouros de um duende malvado, que as meninas encontram repetidas vezes e ajudam a se livrar de enrascadas cortando sua barba, recebendo apenas ingratidão em troca. No ápice, o urso enfrenta o duende que, apavorado, tenta entregar suas irmãs ao urso para preservar sua vida e seus tesouros. No entanto, o urso mata o duende e, ao se desfazer de sua pele, revela-se um príncipe encantado.</p>', '15133_Branca-de-Neve-e-Rosa-Vermelha---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/79411_Branca-de-Neve-e-Rosa-Vermelha---Irmãos-Grimm.pdf', 0, '0', 2, 1),
(157, '7', '52,53,24', 13, 0, 'O cortiço', '<p>O livro descreve a ascensão descontrolada de João Romão, um português que, por meio de exploração e avareza, ergue o amplo e barulhento cortiço de São Romão. Isso provoca inveja em seu vizinho rico, Miranda, e o coloca em um cenário de vida laboral intensa e brutal. Por outro lado, a vida humilde e sincera do trabalhador português Jerônimo e sua esposa Piedade é perturbada pela chegada da sedutora Rita Baiana, uma mulata que simboliza a sensualidade e a sensualidade do Brasil. Seu canto e dança provocam um despertar carnal intenso em Jerônimo, fazendo-o deixar de lado seu trabalho e sentir repulsa pela esposa.</p>', '73407_O-corti&ccedil;o---Alu&iacute;sio-Azevedo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/44742_O-cortiço---Aluísio-Azevedo.pdf', 0, '0', 1, 1),
(158, '7', '64,49', 58, 0, 'A pequena vendedora de fósforos', '<p>Na véspera de Ano Novo, uma pobre menina descalça e faminta tentava vender fósforos na rua sob um frio intenso, mas não conseguia vender nada e temia voltar para casa, onde seria punida pelo pai. Para se aquecer, ela acendeu os fósforos um a um, e cada chama lhe trazia visões calorosas e alegres de um fogão, um ganso assado e uma árvore de Natal. Ao acender os últimos palitos, ela viu sua falecida avó e, para não a perder, manteve todos os fósforos acesos. Na manhã seguinte, ela foi encontrada morta de frio no canto da rua, mas sua alma havia sido levada pela avó para um lugar onde não havia mais frio, fome ou medo.</p>', '6121_A-pequena-vendedora-de-f&oacute;sforos---Hans-Christian-Andersen.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/44245_A-pequena-vendedora-de-fósforos---Hans-Christian-Andersen.pdf', 0, '0', 3, 1),
(159, '7', '66,70,24', 35, 0, 'A moreninha', '<p>O romance <em>A Moreninha</em> narra a história de Augusto, um estudante de Medicina com fama de inconstante, que aposta com o amigo Filipe que jamais se apaixonará por uma mulher por mais de quinze dias, sob a condição de, se perder, escrever um romance. A prova de sua volubilidade ocorre na Ilha de…, onde Augusto passará um feriado com a avó de Filipe, D. Ana, e suas três primas: D. Joana, D. Quinquina e a espirituosa D. Carolina, apelidada de “Moreninha”.</p>', '30761_A-moreninha---Joaquim-Manuel-de-Macedo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/17386_A-moreninha---Joaquim-Manuel-de-Macedo.pdf', 0, '0', 2, 1),
(160, '7', '66,53', 31, 0, 'Macário', '<p>O drama Macário, de Aluísio Azevedo, apresenta o estudante Macário, um jovem cínico e materialista, que rejeita o romantismo e os valores convencionais. Sua jornada é marcada pelo encontro com Satã, disfarçado de viajante, que o confronta com visões sobre a natureza da vida e da morte. Contrastando com o ceticismo de Macário, está o poeta idealista Penseroso, que, ao ser traído nas suas ilusões de amor, sucumbe ao desespero e comete suicídio. A peça explora a dualidade entre o niilismo e o idealismo, culminando com Satã reafirmando seu controle sobre a alma de Macário em meio à dissolução moral.</p>', '76338_Mac&aacute;rio---Alu&iacute;sio-Azevedo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/13401_Macário---Aluísio-Azevedo.pdf', 0, '0', 5, 1);
INSERT INTO `tbl_books` (`id`, `cat_id`, `section_ids`, `aid`, `featured`, `book_title`, `book_description`, `book_cover_img`, `book_file_type`, `book_file_url`, `total_rate`, `rate_avg`, `book_views`, `status`) VALUES
(161, '7', '48,70,47', 35, 0, 'A pupila rica', '<p>A comédia de Joaquim Manuel de Macedo, A Pupila Rica, narra a história de Corina, uma órfã cuja grande fortuna é cobiçada pelo seu tutor, Firmino, e sua esposa, Teodora, que tentam forçá-la a casar-se com seus respectivos filhos, Peregrino ou Carlos, em meio a um confinamento cruel. O enredo demonstra a falsidade e a cobiça familiar, que é confrontada pela tia Suzana, uma figura moralizadora que defende a liberdade da órfã. Depois de desvendar esquemas de sequestro e difamação, com a ajuda do noivo legítimo de Corina, o Dr. André de Araújo, a honra da jovem é recuperada, levando Firmino a ceder e permitindo o matrimônio movido pelo amor.</p>', '62690_Uma-pupila-rica---Joaquim-Manuel-de-Macedo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/25901_Uma-pupila-rica---Joaquim-Manuel-de-Macedo.pdf', 0, '0', 25, 1),
(162, '7', '70,47', 35, 0, 'Amor e P&aacute;tria', '<p>Amor e Pátria, escrito por Joaquim Manuel de Macedo, é uma tragédia que se passa no Rio de Janeiro em setembro de 1822, entrelaçando as comemorações do aniversário e matrimônio de Afonsina com a agitação da iminente Independência do Brasil. A trama se foca na intriga em que o noivo, o patriota fervoroso Luciano, é injustamente acusado de infidelidade ao pai de Afonsina, Plácido, por um desonesto chamado Velasco. Este, por sua vez, deseja a noiva e o patrimônio familiar. Plácido, ao descobrir a suposta traição, rompe o noivado e humilha Luciano, mas o engano é rapidamente desfeito quando a lealdade e os esforços de Luciano para salvar Plácido da deportação são revelados, expondo Velasco como o verdadeiro denunciante. O drama se resolve com a união dos noivos, coincidindo com a chegada da notícia do \\\"Independência ou Morte\\\" do Príncipe, que transforma a festa familiar em uma grandiosa celebração do triunfo do amor e da pátria brasileira.</p>', '90825_Amor-e-P&aacute;tria---Joaquim-Manuel-de-Macedo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/90497_Amor-e-Pátria---Joaquim-Manuel-de-Macedo.pdf', 0, '0', 6, 1),
(163, '7', '53,47', 4, 0, 'Patkull', '<p>A tragédia de Gonçalves Dias, \"Patkull,\" narra a história do nobre livônio Patkull, um patriota e embaixador que é traído tanto na política quanto no amor. Enviado numa missão diplomática pelo Czar, ele deixa sua noiva, Namry Romhor, sob a custódia de seu amigo, o alquimista Paikel, sem saber que os dois são ex-amantes. Paikel usa a oportunidade para reconquistar Namry, mas é exposto por Bertha, ex-amante de Paikel, que alerta Patkull sobre a traição. Patkull é preso e condenado a uma execução brutal por ordem de Carlos XII da Suécia, forçando Namry a implorar por sua vida, embora sem sucesso. No clímax, Paikel tenta sacrificar-se pelo amigo, mas Bertha intervém, garantindo a prisão de Paikel em vez de Patkull. Patkull, ciente da infidelidade, mas consolado pela visita de Namry antes de seu fim, parte para o cadafalso.</p>', '22593_PATKULL----Gon&ccedil;alves-Dias.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/87446_PATKULL----Gonçalves-Dias.pdf', 0, '0', 0, 1),
(164, '7', '49', 25, 0, 'O alfaiate no c&eacute;u', '<p>O conto narra a história de um alfaiate que, após implorar a São Pedro para entrar no céu, aproveita a ausência do Senhor para explorar o lugar e sentar-se em seu trono. Ao observar a Terra de cima, ele se enfurece ao ver uma mulher roubando roupas e atira um escabelo de ouro nela; ao ser descoberto, o Senhor repreende o alfaiate por tentar exercer o papel de juiz e o expulsa do céu, deixando-o partir a pé, enquanto os outros riem de sua petulância.</p>', '13029_O-alfaiate-no-c&eacute;u---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/28830_O-alfaiate-no-céu---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(165, '7', '49', 25, 0, 'A mesa mágica, o asno que cuspia ouro e o porrete dentro do saco', '<p>\"A mesa encantada, o asno que expelia ouro e o porrete escondido no saco\" conta a história de três irmãos que, após serem injustamente expulsos de casa pelo pai por causa das falsidades de uma cabra, aprendem ofícios e ganham itens mágicos únicos - uma mesa que organiza banquetes, um asno que fabrica moedas de ouro e um porrete que pune desordeiros. Depois de serem roubados pelos dois primeiros itens por um estalajadeiro desonesto, o terceiro irmão emprega o porrete mágico para recuperar os presentes e restabelecer a harmonia familiar, fomentando o reencontro e a prosperidade para o alfaiate e seus descendentes.</p>', '53803_A-mesa-m&aacute;gica,-o-asno-que-cuspia-ouro-e-o-porrete-dentro-do-saco---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/2389_A-mesa-mágica,-o-asno-que-cuspia-ouro-e-o-porrete-dentro-do-saco---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(166, '7', '49', 25, 0, 'Elsie, a sensata', '<p>\"Elsie, a sensata\" conta a história de uma moça cujo comportamento irracional é erroneamente visto como inteligência por sua família e seu futuro marido, Hans. Após uma cena cômica em que todos choram por uma tragédia hipotética futura envolvendo uma picareta, Elsie se casa, mas sua falta de bom senso culmina em uma crise de identidade ao acordar com sinos presos ao corpo, levando-a a abandonar seu lar e desaparecer para sempre.<br /> </p>', '93118_Elsie,-a-sensata---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/38857_Elsie,-a-sensata---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(167, '7', '49', 25, 0, 'As três linguagens', '<p>O conto narra a trajetória de um jovem considerado incapaz pelo pai que, ao aprender a linguagem de cachorros, pássaros e sapos, acaba descobrindo um tesouro e, eventualmente, cumprindo o destino profetizado de tornar-se Papa, demonstrando que o verdadeiro valor e o conhecimento podem surgir de formas inesperadas.</p><div><div class=\"gtx-trans-icon\"> </div></div>', '9963_As-tr&ecirc;s-linguagens---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/75823_As-três-linguagens---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(168, '7', '49', 25, 0, 'O Senhor Korbes', '<p>Neste conto dos Irmãos Grimm, um galo e uma galinha viajam até a casa do Senhor Korbes, escoltados por vários animais e objetos que se escondem no interior da casa. Quando o proprietário da casa retorna, é atacado sucessivamente por cada um deles - o gato, o pato, o ovo, a agulha e, finalmente, uma pedra de moinho - culminando em sua morte.</p>', '87160_O-Senhor-Korbes---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/35957_O-Senhor-Korbes---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(169, '7', '49', 25, 0, 'O Senhor Compadre', '<p>O conto dos Irmãos Grimm conta a história de um homem de baixa renda que, ao convidar a Morte para ser madrinha de seu filho, adquire uma habilidade mágica de cura que o transforma em uma pessoa rica e famosa ao notar a atitude da Morte em relação aos doentes. Ao visitar a estranha e assustadora casa de seu compadre, o homem descobre a verdadeira natureza de seu padrinho e, apavorado com as visões macabras, foge antes de sofrer alguma consequência.</p>', '65540_O-Senhor-Compadre---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/46793_O-Senhor-Compadre---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(170, '7', '49', 25, 0, 'A senhora Trude', '<p>O conto “A Senhora Trude”, dos Irmãos Grimm, narra a história de uma garota teimosa que, desobedecendo aos pais, decide visitar a enigmática Senhora Trude, sobre quem ouvira histórias estranhas. Quando a menina chega em casa, ela se depara com figuras enigmáticas e, por fim, com a própria dona, que se revela uma feiticeira. Em resposta à sua desobediência e curiosidade, a garota é convertida em um bloco de madeira e queimada na fogueira para iluminar o ambiente, representando uma lição moral acerca da desobediência infantil.</p>', '78760_A-senhora-Trude---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/91205_A-senhora-Trude---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(171, '7', '49', 25, 0, 'O p&aacute;ssaro de ouro', '<p>“O Pássaro de Ouro”, uma obra dos Irmãos Grimm, conta a história do filho mais novo de um monarca que, diferentemente de seus irmãos mais velhos, segue as orientações de uma raposa encantada para recuperar itens preciosos, um pássaro de ouro, um cavalo veloz e uma princesa, para o pai. Apesar de enfrentar a ganância e a traição de seus irmãos, o protagonista, sempre auxiliado pela raposa, supera as provações impostas. No desfecho, a narrativa desvenda que a raposa é, na realidade, o irmão desaparecido da princesa, que retorna à sua forma humana após o jovem satisfazer seu último desejo de liberdade.</p>', '51852_O-p&aacute;ssaro-de-ouro---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/3568_O-pássaro-de-ouro---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(172, '7', '49', 25, 0, 'O Diabo com os Três Cabelos de Ouro', '<p>Um rapaz afortunado, vítima da cobiça de um monarca que tentou matá-lo devido a uma profecia, acaba se unindo à princesa após uma sequência de acontecimentos imprevisíveis. Para consolidar seu futuro, ele enfrenta o desafio de buscar três cabelos de ouro do diabo, conseguindo, em sua jornada, ajudar um barqueiro e duas cidades a resolverem problemas insolúveis através da sabedoria que obteve no inferno. Ao chegar, o monarca, ansioso e abastado, tenta replicar a jornada do rapaz em busca de mais ouro. No entanto, é sentenciado a ocupar a posição do barqueiro para sempre, enquanto o jovem desfruta de uma vida plena com sua esposa.</p>', '56710_O-Diabo-com-os-Tr&ecirc;s-Cabelos-de-Ouro---Irm&atilde;os-Grimm.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/70719_O-Diabo-com-os-Três-Cabelos-de-Ouro---Irmãos-Grimm.pdf', 0, '0', 0, 1),
(173, '7', '49,66,36', 39, 0, 'Fábulas de Esopo', '<p>As \"Fábulas de Esopo\" representam uma compilação crucial da literatura global, atuando como um manual perene de sabedoria prática e moral. Por meio de contos breves que empregam animais como personagens, o trabalho retrata atitudes humanas, defeitos e qualidades, proporcionando ensinamentos que se mantêm pertinentes, independentemente do contexto histórico.</p>', '50705_F&aacute;bulas-de-Esopo.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/89361_Fábulas-de-Esopo.pdf', 0, '0', 0, 1),
(174, '7', '66,59', 22, 0, 'Paulo', '<p>\"Paulo\", obra publicada por Bruno Seabra em 1861, acompanha a trajetória de um talentoso pintor provinciano que, impulsionado pelo amor à filha de um ex-político e pelo desejo de ascensão profissional na corte, enfrenta obstáculos sociais e decepções que levam a uma trágica conclusão, explorando dilemas sobre a integridade artística e a realidade da época.</p>', '5696_Paulo---Bruno-Seabra.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/90491_Paulo---Bruno-Seabra.pdf', 0, '0', 0, 1),
(175, '10', '66', 9, 0, 'A J. J. C. Macedo-J&uacute;nior', '<p>Em “A J. J. C. Macedo-Júnior”, Casimiro de Abreu saúda o talento precoce de um jovem poeta, oferecendo-lhe conselhos de mentor para preservar sua inocência e integridade artística diante das tentações e amarguras do mundo. O poema é um incentivo para o jovem continuar a dedicar sua voz à beleza da natureza, ao amor e à esperança, evitando os caminhos autodestrutivos trilhados por outros escritores de sua época.</p>', '4443_A-J.-J.-C.-Macedo-J&uacute;nior---Casimiro-de-Abreu.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/28960_A-J.-J.-C.-Macedo-Júnior---Casimiro-de-Abreu.pdf', 0, '0', 7, 1),
(176, '10,6', '66,70,27,29,41', 9, 0, 'Carolina', '<p>Carolina, de Casimiro de Abreu, é uma obra que retrata um amor idealizado e marcado pela sensibilidade romântica. A narrativa acompanha os sentimentos do eu lírico por Carolina, exaltando sua beleza, pureza e delicadeza. Ao longo do texto, predominam a saudade, a esperança e a melancolia, características do Romantismo brasileiro. A obra valoriza as emoções e a intensidade dos afetos acima da razão. Com uma linguagem simples e poética, Casimiro de Abreu transmite a força do amor e das lembranças.</p>', '36281_Casimiro-de-Abreu.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/45303_Casimiro-de-Abreu---Carolina_corrigido.pdf', 0, '0', 3, 1),
(179, '10,6', '66,70,44,27,29,41', 9, 0, 'Deus!', '<p>Em \\\"Deus!\\\", de Casimiro de Abreu, é um poema em que Casimiro de Abreu expressa sua profunda fé e admiração pela grandeza divina. O eu lírico contempla a natureza e o universo como manifestações da presença de Deus. A obra une espiritualidade, emoção e reflexão sobre a existência humana. Com linguagem simples e sensível, o poeta transmite sentimentos de humildade, esperança e reverência. Os versos revelam a busca por conforto e sentido diante das incertezas da vida. O poema destaca a religiosidade e a contemplação, traços marcantes da poesia romântica do autor.</p>', '99235_25.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/59581_Casimiro-de-Abreu---Deus!_corrigido.pdf', 0, '0', 1, 1),
(180, '10,6', '66,70,44,27,29,41', 9, 0, 'De Joelhos', '<p>Em \\\\\\\"De Joelhos\\\\\\\", de Casimiro de Abreu, é um poema em que Casimiro de Abreu retrata um momento de intensa oração e entrega espiritual. O eu lírico dirige-se a Deus com humildade, buscando perdão, consolo e força para enfrentar as dificuldades da vida. A obra evidencia a fé como fonte de esperança e renovação. Com linguagem delicada e emotiva, o poeta expressa sinceridade e profunda devoção. Os versos unem reflexão, religiosidade e sensibilidade, características do Romantismo. O poema transmite uma mensagem de confiança na misericórdia divina e de fortalecimento da alma.</p>', '27930_183.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/4497_Casimiro-de-Abreu---De-joelhos_corrigido.pdf', 0, '0', 1, 1),
(181, '10,6', '66,70,27,29,41', 9, 0, 'Clara', '<p>Em \\\\\\\"Clara\\\\\\\", de Casimiro de Abreu, é um poema em que Casimiro de Abreu retrata uma figura feminina idealizada, destacando sua beleza, delicadeza e pureza. O eu lírico expressa sentimentos de admiração e afeto, típicos da poesia romântica. A obra valoriza o amor como um sentimento intenso e inspirador. Com linguagem simples e musical, o poeta transmite emoção e sensibilidade em cada verso. A idealização da mulher e a exaltação dos sentimentos são elementos centrais do poema. Clara reflete o estilo lírico e sentimental que marcou a produção de Casimiro de Abreu.</p>', '53790_42.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/60996_Casimiro-de-Abreu---Clara_corrigido.pdf', 0, '0', 1, 1),
(182, '10,6', '66,70,44,27,29,41', 9, 0, 'Canto de Amor', '<p>Em \\\"Canto de Amor\\\", de Casimiro de Abreu, é um poema em que Casimiro de Abreu celebra o amor como um sentimento puro, intenso e transformador. O eu lírico revela sua admiração pela pessoa amada, exaltando sua beleza e suas virtudes. A obra destaca a idealização amorosa, característica marcante do Romantismo brasileiro. Com versos delicados e linguagem simples, o poeta transmite emoção e sinceridade. Os temas da esperança, da saudade e do desejo também aparecem ao longo do poema. Canto de Amor evidencia a sensibilidade e o lirismo que tornaram Casimiro de Abreu um dos grandes poetas românticos do Brasil.</p>', '55165_159.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/81284_Casimiro-de-Abreu---Canto-de-amor_corrigido.pdf', 0, '0', 0, 1),
(183, '10,6', '52,66,53,44,29,41', 9, 0, 'Can&ccedil;&atilde;o do Ex&iacute;lio', '<p>Em \\\"Canção do Exílio\\\", de Casimiro de Abreu, é um poema que expressa a saudade da pátria e o profundo amor pelo Brasil. Escrito durante um período em que o autor estava em Portugal, a obra compara a beleza da natureza brasileira com a do país estrangeiro. O eu lírico exalta elementos como as palmeiras, os sabiás e as paisagens nacionais. Com forte sentimento nacionalista, o poema tornou-se um dos maiores símbolos do Romantismo brasileiro. A linguagem simples e musical reforça a emoção da distância e do desejo de retornar à terra natal. A obra celebra a identidade brasileira e o vínculo afetivo com o país.</p>', '71190_22.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/87981_Casimiro-de-Abreu---Canção-do-Exílio_corrigido.pdf', 0, '0', 0, 1),
(184, '10,6', '66,70,27,29,41', 9, 0, 'Borboleta', '<p>Em \\\"Borboleta\\\", de Casimiro de Abreu, é um poema em que Casimiro de Abreu utiliza a figura da borboleta como símbolo da beleza, da liberdade e da delicadeza da vida. O eu lírico observa a leveza do inseto e estabelece reflexões sobre a juventude, os sonhos e a passagem do tempo. A obra apresenta uma linguagem simples, musical e repleta de sensibilidade. A natureza ocupa papel central, reforçando características do Romantismo brasileiro. Os versos despertam sentimentos de contemplação e encantamento diante das pequenas belezas do mundo. O poema evidencia o lirismo e a delicadeza que marcam a poesia de Casimiro de Abreu.</p>', '5068_19.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/45299_Casimiro-de-Abreu---Borboleta_corrigido.pdf', 0, '0', 0, 1),
(185, '10,6', '52,66,70,44,27,29,41', 9, 0, 'B&aacute;lsamo', '<p>Em \\\"Bálsamo\\\", de Casimiro de Abreu, é um poema em que Casimiro de Abreu aborda a busca por alívio diante das dores e das angústias da vida. O eu lírico encontra no amor, na fé e na esperança um conforto capaz de amenizar o sofrimento. A obra destaca a força dos sentimentos e da espiritualidade como formas de renovação interior. Com linguagem delicada e emotiva, o poeta transmite sensibilidade e reflexão. A melancolia e o idealismo, marcas do Romantismo, estão presentes em seus versos. O poema convida o leitor a enxergar a esperança como um verdadeiro bálsamo para a alma.</p>', '82332_21.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/4387_Casimiro-de-Abreu---Bálsamo_corrigido.pdf', 0, '0', 0, 1),
(186, '10,6', '66,53,27,29,41', 9, 0, 'A uma Plat&eacute;ia', '<p>Em \\\"A uma Platéia\\\", de Casimiro de Abreu, é um poema em que Casimiro de Abreu estabelece um diálogo direto com o público, compartilhando seus sentimentos e sua visão sobre a poesia. O eu lírico destaca a sinceridade de seus versos e a importância da emoção na criação artística. A obra valoriza a sensibilidade e a expressão autêntica dos sentimentos, características do Romantismo. Com linguagem simples e envolvente, o poeta busca aproximar-se de seus leitores. O poema reflete sobre a relação entre o artista e sua plateia, ressaltando o papel da poesia como forma de comunicação. A mensagem central evidencia a emoção e a sinceridade como essência da arte poética.</p>', '2346_121.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/11166_Casimiro-de-Abreu---A-uma-Platéia_corrigido.pdf', 0, '0', 0, 1),
(187, '10,6', '66,70,44,27,29,41', 9, 0, 'A Voz do Rio', '<p>Em \\\"A Voz do Rio\\\", de Casimiro de Abreu, é um poema em que Casimiro de Abreu utiliza o rio como símbolo do tempo, da vida e das lembranças. O eu lírico contempla o curso das águas e reflete sobre a passagem dos dias e os sentimentos que permanecem na memória. A natureza assume um papel central, transmitindo paz e inspiração ao poeta. Com linguagem simples e musical, a obra expressa emoção e sensibilidade. Os temas da saudade, da contemplação e da esperança reforçam as características do Romantismo brasileiro. O poema convida o leitor a refletir sobre a constante transformação da vida e a beleza da natureza.</p>', '75432_23.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/70423_Casimiro-de-Abreu---A-Voz-do-Rio_corrigido.pdf', 0, '0', 0, 1),
(188, '10,6', '66,70,27,29,41', 9, 0, 'Anjo!', '<p>Em \\\"Anjo!\\\", de Casimiro de Abreu, é um poema em que Casimiro de Abreu idealiza a figura de um anjo como símbolo de pureza, bondade e beleza espiritual. O eu lírico manifesta admiração e afeto, exaltando a delicadeza e a inocência desse ser idealizado. A obra destaca o amor, a esperança e a elevação dos sentimentos, características marcantes do Romantismo. Com linguagem simples e musical, o poeta cria uma atmosfera de ternura e contemplação. Os versos unem emoção e espiritualidade, transmitindo sensibilidade ao leitor. O poema evidencia o lirismo característico de Casimiro de Abreu e sua valorização dos sentimentos mais puros.</p>', '61474_20.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/7940_Casimiro-de-Abreu---Anjo!_corrigido.pdf', 0, '0', 0, 1),
(189, '10,6', '66,70,44,27,29,41', 9, 0, 'A Valsa', '<p>Em \\\"A Valsa\\\", de Casimiro de Abreu, é um poema em que Casimiro de Abreu utiliza a dança como cenário para retratar o encanto do amor e da juventude. O eu lírico descreve a beleza e a emoção de um momento marcado pela delicadeza e pela aproximação entre os apaixonados. A obra valoriza a idealização da mulher e a intensidade dos sentimentos, traços do Romantismo brasileiro. Com linguagem leve e musical, o poeta cria uma atmosfera de elegância e nostalgia. Os versos unem beleza, emoção e sensibilidade em uma cena memorável. O poema celebra a fugacidade dos momentos felizes e a força das lembranças afetivas.</p>', '43666_001.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/39793_Casimiro-de-Abreu---A-Valsa_corrigido.pdf', 0, '0', 0, 1),
(190, '6', '69,27,41,37', 65, 0, 'A Brasileira', '<p>Em \\\\\\\\\\\\\\\"A Brasileira\\\\\\\\\\\\\\\", de Chiquinha Gonzaga, é uma composição de Chiquinha Gonzaga que celebra a identidade e a cultura do Brasil por meio da música. A obra apresenta ritmo marcante e melodias que refletem elementos da música popular brasileira do fim do século XIX. Sua criação evidencia a valorização das tradições nacionais e da criatividade artística. A composição demonstra o talento inovador da autora, uma das pioneiras da música brasileira. Com grande expressividade, a peça transmite alegria, energia e sentimento patriótico. A Brasileira permanece como um importante marco da história da música no Brasil.</p>', '68670_Capas---Corinha-(1).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/22991_Chiquinha-Gonzaga---A-Brasileira_corrigido.pdf', 0, '0', 2, 1),
(191, '6', '66,27,41,37', 65, 0, 'A partida do Tropeiro', '<p>Em \\\"A Partida do Tropeiro\\\", de Chiquinha Gonzaga, é uma composição que evoca a rotina e a despedida de um tropeiro antes de iniciar sua viagem. A obra transmite, por meio da música, sentimentos de coragem, saudade e esperança diante do caminho a percorrer. Inspirada no cotidiano brasileiro do século XIX, valoriza aspectos da cultura popular e da vida no interior. A atmosfera alterna momentos de energia e emoção, sugerindo o movimento da jornada. A composição destaca a sensibilidade de Chiquinha Gonzaga ao retratar cenas típicas do Brasil. É uma obra que preserva elementos históricos e culturais da época.</p>', '50307_Capas---Corinha-(2).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/37758_Chiquinha-Gonzaga---A-partida-do-tropeiro_corrigido.pdf', 0, '0', 0, 1),
(192, '6', '69,44,27,41', 65, 0, 'A Sertaneja', '<p>Em \\\"A Sertaneja\\\", de Chiquinha Gonzaga, é uma composição inspirada na vida e na cultura do sertão brasileiro, valorizando suas paisagens, costumes e tradições. A obra transmite a simplicidade e a força do povo sertanejo por meio de uma linguagem musical expressiva. Sua atmosfera evoca sentimentos de identidade, pertencimento e respeito pela natureza. A composição destaca elementos característicos da cultura nacional e do interior do Brasil. Com forte caráter artístico, contribui para a valorização da música brasileira. A Sertaneja reflete a sensibilidade e a criatividade que marcaram a produção de Chiquinha Gonzaga.</p>', '74364_Capas---Corinha-(3).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/63572_Chiquinha-Gonzaga---A-Sertaneja_corrigido.pdf', 0, '0', 0, 1),
(193, '6', '69,27,37', 65, 0, '&Oacute; Abre Alas', '<p>Em \\\"Ó Abre Alas\\\", de Chiquinha Gonzaga, é uma marchinha carnavalesca composta em 1899 que celebra a alegria, a liberdade e o espírito festivo do Carnaval brasileiro. A canção convida o público a abrir caminho para o desfile do cordão carnavalesco, transmitindo entusiasmo e animação. Com melodia simples e marcante, tornou-se um dos maiores símbolos da música popular brasileira. A obra representa a inovação de Chiquinha Gonzaga na história da música nacional. Seu ritmo contagiante atravessou gerações e permanece presente nas festas carnavalescas. Ó Abre Alas é considerada um marco da cultura e da tradição do Carnaval no Brasil.</p>', '96730_Capas---Corinha-(4).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/94748_Chiquinha-Gonzaga---Abre-Alas_corrigido.pdf', 0, '0', 0, 1),
(194, '6', '69,27,29,41', 65, 0, 'Amor no Cora&ccedil;&atilde;o', '<p>Em \\\"Amor no Coração\\\", de Chiquinha Gonzaga, é uma composição poética que celebra o amor como um sentimento capaz de inspirar alegria, esperança e sensibilidade. A obra destaca a delicadeza das emoções e a valorização dos afetos nas relações humanas. Com linguagem simples e expressiva, transmite uma visão romântica dos sentimentos. Os versos exploram a beleza do amor e sua influência na vida das pessoas. A musicalidade e a emoção são elementos marcantes do texto. A obra reflete o lirismo presente na produção artística de Chiquinha Gonzaga.</p>', '28865_Capas---Corinha-(5).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/81704_Chiquinha-Gonzaga---Amor-no-coração_corrigido.pdf', 0, '0', 1, 1),
(195, '6', '69,27,29,41', 65, 0, 'Benzinho', '<p>Em \\\"Benzinho\\\", de Chiquinha Gonzaga, é uma canção-poema que celebra o amor simples, a alegria das festas populares e a valorização da cultura brasileira. A letra retrata o carinho entre os apaixonados em meio às comemorações de São João. Com linguagem leve e ritmo festivo, a obra convida à dança e à convivência. Também transmite uma mensagem de valorização da identidade e da beleza do povo brasileiro. O ambiente rural e a tradição das festas juninas reforçam o caráter popular da composição. A obra destaca o amor, a música e a celebração da vida.</p>', '50494_Capas---Corinha-(6).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/9897_Chiquinha-Gonzaga---Benzinho_corrigido.pdf', 0, '0', 0, 1),
(196, '7', '48,50,69,41,37,47', 65, 0, 'Casa de Cabloco', '<p>Em \\\"Casa de Caboclo\\\", de Chiquinha Gonzaga, é uma opereta que retrata, com humor e música, aspectos do cotidiano brasileiro e das tradições populares. A obra apresenta personagens inspirados na cultura rural e nas relações sociais de sua época. Por meio de situações cômicas, aborda costumes, diferenças sociais e a identidade nacional. A linguagem leve e os diálogos dinâmicos aproximam o público da realidade retratada. A música desempenha papel central na construção da narrativa e na caracterização dos personagens. A obra destaca o talento de Chiquinha Gonzaga ao unir entretenimento e elementos da cultura brasileira.</p>', '84010_Capas---Corinha-(7).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/17912_Chiquinha-Gonzaga---Casa-de-Caboclo_corrigido.pdf', 0, '0', 0, 1),
(197, '7', '48,41,37,47,51', 65, 0, 'Casa do Paulista', '<p>Em \\\"Casa do Paulista\\\", de Chiquinha Gonzaga, é uma peça teatral musicada que retrata situações do cotidiano com humor e crítica aos costumes da sociedade brasileira do final do século XIX. A obra apresenta personagens populares e conflitos marcados por interesses, relações familiares e diferenças sociais. Com diálogos leves e momentos cômicos, destaca aspectos da vida urbana da época. A música desempenha papel fundamental na construção da narrativa. O texto combina entretenimento com observações sobre o comportamento social. A obra reflete o talento de Chiquinha Gonzaga para unir teatro e música.</p>', '34300_Capas---Corinha-(8).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/94596_Chiquinha-Gonzaga---Casa-do-Paulista_corrigido.pdf', 0, '0', 0, 1),
(198, '7', '41,37,47', 65, 0, 'C&ocirc;ra', '<p>Em \\\\\\\"<em>Côra\\\\\\\", </em>de Chiquinha Gonzaga, é uma peça teatral musicada que combina romance, emoção e elementos da vida cotidiana. A obra acompanha a trajetória da personagem Côra, explorando seus sentimentos, conflitos e relações pessoais. Com diálogos e músicas, a narrativa reflete costumes e valores da sociedade brasileira do final do século XIX. A protagonista enfrenta desafios que evidenciam questões sociais e afetivas. A linguagem é acessível e voltada ao entretenimento do público. A obra destaca a contribuição de Chiquinha Gonzaga para o teatro musical brasileiro.</p>', '77818_Capas---Corinha-(9).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/11839_Chiquinha-Gonzaga---Cora_corrigido.pdf', 0, '0', 1, 1),
(199, '6', '69,27,41,51', 65, 0, 'Cord&atilde;o Carnavalesco', '<p>Em \\\"Cordão Carnavalesco\\\", de Cordão Carnavalesco, é uma composição que celebra a alegria, a música e a animação do carnaval brasileiro. A obra retrata o espírito festivo dos cordões carnavalescos, destacando a união, a dança e a cultura popular. Com ritmo envolvente e linguagem simples, transmite o entusiasmo das festas de rua. A composição também valoriza as tradições culturais do Rio de Janeiro no final do século XIX. Sua atmosfera é leve, vibrante e marcada pela celebração coletiva. A obra tornou-se um símbolo da música carnavalesca brasileira.</p>', '53944_Capas---Corinha-(10).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/78818_Chiquinha-Gonzaga---Cordão-Carnavalesco_corrigido.pdf', 0, '0', 0, 1),
(200, '6', '69,37,51', 65, 0, 'Corta-Jaca', '<p>Em \\\"Corta-Jaca\\\", de Chiquinha Gonzaga, embora seja conhecida como uma composição musical, <em>Corta-Jaca</em> tornou-se um dos maiores símbolos da música popular brasileira do início do século XX. A obra mistura elementos do maxixe e da música urbana, retratando a alegria, a espontaneidade e o ritmo característicos da cultura brasileira. Sua popularidade ajudou a romper barreiras entre a música popular e os ambientes mais formais da época. A composição também provocou debates sobre identidade cultural e preconceito contra manifestações populares. Hoje, é reconhecida como um marco da história da música brasileira.</p>', '959_Capas---Corinha-(11).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/40383_Chiquinha-Gonzaga---Corta-Jaca_corrigido.pdf', 0, '0', 1, 1),
(201, '7', '48,41,37,47', 65, 0, 'Corte na Ro&ccedil;a', '<p>Em \\\"Corte na Roça\\\", de Chiquinha Gonzaga, é uma opereta que retrata, com humor e leveza, costumes e situações vividas no ambiente rural brasileiro. A obra acompanha personagens típicos do campo, explorando suas relações, tradições e conflitos cotidianos. Por meio de diálogos e músicas, apresenta um retrato da vida no interior do Brasil no final do século XIX. A narrativa combina entretenimento e observações sobre a sociedade da época. Com linguagem acessível e tom cômico, destaca a cultura popular brasileira. A obra é considerada um importante exemplo do teatro musical nacional.</p>', '36849_Capas---Corinha-(12).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/21168_Chiquinha-Gonzaga---Corte-na-roça_corrigido.pdf', 0, '0', 0, 1),
(202, '7', '48,50,69,41,37,47', 65, 0, 'D. Adelaide', '<p>Em \\\"D. Adelaide\\\", de Chiquinha Gonzaga, é uma peça teatral que retrata personagens e situações do cotidiano brasileiro com leveza e humor. A obra explora relações familiares e sociais, evidenciando costumes e comportamentos da sociedade da época. Por meio de diálogos envolventes, Chiquinha Gonzaga apresenta críticas sutis às convenções sociais. O texto combina entretenimento e observação da realidade urbana. A autora valoriza personagens femininas marcantes e situações reconhecíveis pelo público. A peça reflete aspectos da vida brasileira do final do século XIX.</p>', '3786_Capas---Corinha-(13).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/13260_Chiquinha-Gonzaga---D.-Adelaide_corrigido.pdf', 0, '0', 0, 1),
(203, '6', '69,27,29,41', 65, 0, 'Fado dos Desejos', '<p>Em \\\"Fado dos Desejos\\\", de Chiquinha Gonzaga, é uma composição poética que expressa sentimentos profundos de amor, esperança e anseios do eu lírico. A obra explora os desejos e as emoções humanas por meio de versos delicados e marcados pela musicalidade. Com linguagem sensível, transmite reflexões sobre os sonhos e as expectativas da vida. A influência da música reforça a intensidade emocional do texto. Os versos valorizam a expressão dos sentimentos e a beleza da linguagem poética. A obra destaca o lirismo característico da produção artística de Chiquinha Gonzaga.</p>', '80162_Capas---Corinha-(14).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/24354_Chiquinha-Gonzaga---Fado-dos-desejos_corrigido.pdf', 0, '0', 0, 1),
(204, '6', '27,41', 65, 0, 'Fogo-Foguinho', '<p>Em \\\"Fogo-Foguinho\\\", de Chiquinha Gonzaga, é uma composição de caráter leve e bem-humorado, marcada pelo ritmo alegre e pela vivacidade característicos da obra de Chiquinha Gonzaga. A peça transmite energia e movimento, evocando a atmosfera festiva das celebrações populares brasileiras. Sua melodia cativante desperta imaginação e entusiasmo, convidando o público a apreciar a riqueza da música nacional. A obra evidencia o talento da compositora para criar temas expressivos e envolventes. Embora não apresente uma narrativa propriamente dita, destaca-se pelo valor artístico e cultural. Fogo-Foguinho permanece como exemplo da contribuição de Chiquinha Gonzaga para a música brasileira.</p>', '99434_Capas---Corinha-(15).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/60635_Chiquinha-Gonzaga---Fogo-Foguinho_corrigido.pdf', 0, '0', 0, 1),
(205, '6', '27', 65, 0, 'Granjeiro', '<p>Em \\\"Granjeiro\\\", de Chiquinha Gonzaga, é uma composição de Chiquinha Gonzaga inspirada no ambiente rural e na vida do campo. A obra valoriza costumes, personagens e paisagens típicas do interior brasileiro por meio de uma linguagem leve e expressiva. Seu caráter musical transmite simplicidade, movimento e alegria. A composição evidencia a valorização da cultura popular e das tradições nacionais. Com sensibilidade artística, Chiquinha Gonzaga retrata aspectos do cotidiano rural. A obra integra o conjunto de peças que ajudaram a consolidar a música popular brasileira.</p>', '55653_Capas---Corinha-(16).jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/77649_Chiquinha-Gonzaga---Granjeiro_corrigido.pdf', 0, '0', 0, 1),
(206, '7', '66,47', 23, 0, 'Macbeth', '<p>Em \"Macbeth\", de William Shakespeare, é uma tragédia que narra a ascensão e a queda do nobre escocês Macbeth, impulsionado pela ambição e pelas profecias de três bruxas. Incentivado por Lady Macbeth, ele assassina o rei para tomar o trono da Escócia. Consumido pela culpa e pelo medo de perder o poder, Macbeth mergulha em uma sequência de crimes e atos de violência. A obra explora temas como ambição, poder, destino e consciência moral. Com personagens marcantes e conflitos intensos, a peça revela as consequências devastadoras da busca desenfreada pelo poder. Considerada uma das maiores tragédias da literatura mundial, continua atual por sua profunda análise da natureza humana.</p>', '64300_Shakespeare---Macbeth.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/72713_William-Shakespeare---Macbeth_corrigido-B.pdf', 0, '0', 3, 1),
(207, '7', '67,66', 57, 0, 'Da Terra à Lua', '<p>Da Terra à Lua, de Júlio Verne, narra a ousada iniciativa do Gun-Club, um grupo de artilheiros em Baltimore que, entediado com a paz após a Guerra Civil Americana, decide construir um canhão capaz de lançar um projétil tripulado à Lua. Sob a liderança de Impey Barbicane, a associação mobiliza a ciência americana para planejar a engenharia do projeto, definindo o uso de alumínio para a cápsula e grandes quantidades de algodão-pólvora para a propulsão, com o apoio entusiasmado da nação, apesar da oposição persistente de seu rival, o capitão Nichol.</p>', '89099_Da-Terra-&agrave;-Lua---J&uacute;lio-Verne.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/87427_Da-Terra-à-Lua---Júlio-Verne.pdf', 0, '0', 0, 1),
(208, '8', '66,70', 66, 0, 'À margem da História', '<p>À Margem da História é uma obra ensaística que retrata a Amazônia não como um cenário mítico ou puramente geográfico, mas como uma região real, marcada por uma natureza imensa e, por vezes, hostil, e por uma sociedade forjada em condições de isolamento e exploração, em que o homem, frequentemente o sertanejo nordestino, tenta domar o deserto, vivendo entre a resiliência heroica e o abandono histórico.</p>', '96993_&Agrave;-margem-da-Hist&oacute;ria---Euclides-da-Cunha.jpg', 'local', 'https://ebook.alenxandriaglobaltec.com//uploads/34760_À-margem-da-História---Euclides-da-Cunha.pdf', 0, '0', 0, 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tbl_book_page_notes`
--

CREATE TABLE `tbl_book_page_notes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `page` int(11) NOT NULL,
  `note` text DEFAULT NULL,
  `is_bookmark` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tbl_book_page_notes`
--

INSERT INTO `tbl_book_page_notes` (`id`, `user_id`, `book_id`, `page`, `note`, `is_bookmark`, `created_at`, `updated_at`) VALUES
(1, 773, 35, 76, '', 1, '2026-02-27 19:12:24', '2026-02-27 19:12:24'),
(2, 773, 35, 120, '', 1, '2026-02-27 19:12:26', '2026-02-27 19:12:26'),
(3, 773, 35, 149, 'teste34', 1, '2026-02-27 19:12:27', '2026-02-27 19:12:31'),
(4, 773, 35, 99, 'teste24', 0, '2026-02-27 19:12:37', '2026-02-27 19:12:37'),
(5, 773, 15, 8, '', 1, '2026-02-27 21:45:09', '2026-02-27 21:45:09'),
(6, 773, 15, 11, 'gostei', 0, '2026-02-27 21:45:16', '2026-02-27 21:45:16'),
(8, 773, 35, 7, 'capítulo O viúvo', 0, '2026-03-02 12:54:29', '2026-03-30 18:55:40'),
(9, 775, 9, 8, '', 1, '2026-03-02 14:57:51', '2026-03-02 14:57:51'),
(10, 773, 18, 12, '', 1, '2026-03-02 15:02:45', '2026-03-02 15:02:45'),
(11, 773, 18, 17, 'teste', 0, '2026-03-02 15:02:52', '2026-03-02 15:02:52'),
(12, 773, 4, 3, '', 1, '2026-03-02 15:07:40', '2026-03-02 15:07:40'),
(13, 773, 4, 71, '7yy', 1, '2026-03-02 15:07:55', '2026-03-02 15:08:13'),
(14, 773, 4, 100, 'amei', 0, '2026-03-02 15:08:28', '2026-03-02 15:08:28'),
(18, 773, 22, 6, '', 1, '2026-05-05 18:06:04', '2026-05-05 18:06:04'),
(19, 773, 22, 20, 'teste', 0, '2026-05-05 18:06:14', '2026-05-05 18:06:14'),
(22, 789, 122, 6, '', 1, '2026-06-25 17:35:19', '2026-06-25 17:35:19'),
(25, 773, 161, 18, '', 1, '2026-08-27 13:26:06', '2026-08-27 13:26:06');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tbl_category`
--

CREATE TABLE `tbl_category` (
  `cid` int(11) NOT NULL,
  `category_name` varchar(50) NOT NULL,
  `category_image` varchar(255) NOT NULL,
  `cat_status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tbl_category`
--

INSERT INTO `tbl_category` (`cid`, `category_name`, `category_image`, `cat_status`) VALUES
(6, 'Poesia', '64730_Poesia.jpg', 0),
(7, 'Ficção', '2460_Fic&ccedil;&atilde;o.jpg', 0),
(8, 'Ensaio', '79539_Ensaio.jpg', 0),
(9, 'Crônicas', '64687_Cr&ocirc;nicas.jpg', 0),
(10, 'Poemas', '35639_Poemas.jpg', 0),
(11, 'Crítica', '79302_Cr&iacute;tica-Liter&aacute;ria.jpg', 0),
(12, 'Infantojuvenil', '92498_Infantojuvenil.jpg', 0),
(13, 'Documento Histórico', '54703_Documento-Hist&oacute;rico.jpg', 1),
(14, 'Infantil', '41626_Infantil.jpg', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tbl_comments`
--

CREATE TABLE `tbl_comments` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_type` varchar(255) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_image` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `comment_text` mediumtext NOT NULL,
  `dt_rate` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `comment_on` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tbl_comments`
--

INSERT INTO `tbl_comments` (`id`, `book_id`, `user_id`, `user_type`, `user_name`, `user_image`, `user_email`, `comment_text`, `dt_rate`, `comment_on`) VALUES
(256, 8, 773, '', 'luis', '', '', 'gostei', '2025-10-27 14:53:58', ''),
(258, 51, 773, '', 'luis', '', '', 'teste', '2026-02-25 13:53:44', '');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tbl_favourite`
--

CREATE TABLE `tbl_favourite` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tbl_favourite`
--

INSERT INTO `tbl_favourite` (`id`, `book_id`, `user_id`) VALUES
(1, 35, 773),
(3, 28, 773),
(4, 9, 775),
(5, 9, 778),
(6, 114, 779),
(7, 76, 783),
(8, 65, 783),
(9, 58, 783),
(10, 150, 784),
(16, 80, 782),
(17, 161, 773);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tbl_home_section`
--

CREATE TABLE `tbl_home_section` (
  `id` int(10) NOT NULL,
  `section_title` varchar(150) NOT NULL,
  `section_books` longtext NOT NULL,
  `status` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tbl_home_section`
--

INSERT INTO `tbl_home_section` (`id`, `section_title`, `section_books`, `status`) VALUES
(24, 'Romance', '52,53,63,64,69,70,71,77,80,86,89,94,113,114,115,120,121,122,136,144,157,159', 1),
(25, 'Abolicionismo', '', 1),
(26, 'Parnasianismo', '19,15,14,13', 1),
(27, 'Poesia brasileira', '9,62,63,106,118,190,191,192,193,194,195,199,203,204,205,176,177,178,179,180,181,182,184,185,186,187,188,189,5,6,7', 1),
(28, 'Sonetos', '18,16,15,14', 1),
(29, 'Poesia lírica', '18,16,15,194,195,203,176,177,178,179,180,181,182,183,184,185,186,187,188,189', 1),
(31, 'Epopeia', '', 1),
(32, 'Poesia narrativa', '106', 1),
(33, 'Imaginação', '109,150', 1),
(34, 'Estética clássica', '', 1),
(35, 'Ficção feminina', '', 1),
(36, 'Narrativa', '113,173', 1),
(37, 'Sociedade brasileira', '52,53,55,61,77,79,87,88,89,95,115,117,122,139,190,191,193,196,197,198,200,201,202', 1),
(38, 'Literatura afro-brasileira', '', 1),
(39, 'Escravidão no Brasil', '', 1),
(40, 'Naturalismo', '113,122', 1),
(41, 'Século XIX', '65,122,190,191,192,194,195,196,197,198,199,201,202,203,204,176,177,178,179,180,181,182,183,184,185,186,187,188,189', 1),
(42, 'Sertão nordestino', '', 1),
(43, 'Literatura social', '56,73', 1),
(44, 'Natureza', '192,177,179,180,182,183,185,187,189', 1),
(45, 'Denúncia social', '', 1),
(46, 'Sátira social', '54,55,57,58,59,61,65,79,87,88,93,117', 1),
(47, 'Teatro', '66,73,81,92,123,124,125,126,127,128,129,130,138,161,162,163,196,197,198,201,202,206', 1),
(48, 'Comédia', '66,105,161,196,197,201,202', 1),
(49, 'Contos', '35,70,98,99,100,101,102,103,109,110,111,112,131,132,133,134,135,142,145,146,147,148,149,152,153,154,155,156,158,164,165,166,167,168,169,170,171,172,173', 1),
(50, 'Cotidiano urbano', '35,52,54,58,59,60,75,76,94,95,105,74,196,202', 1),
(51, 'Vida urbana', '54,55,56,57,58,59,60,95,200,197,199', 1),
(52, 'Leitura Obrigatória Vestibular', '20,62,9,64,10,71,77,86,89,94,104,43,107,108,11,117,157,183,185', 1),
(53, 'Literatura Maranhense', '186,183,163,160,157,122,121,120,113,106,62,52,40,39,38,35,34,30,29,28,27,26,25,23,22,21,9,8,7,6,5,4', 1),
(55, 'Literatura Cearense', '53,51,78,86,107', 1),
(56, 'Literatura Alagoana', '37,24,11,119', 1),
(57, 'Literatura Paulista', '47,45,97,136,137,138,139,140,141,142,143', 1),
(58, 'Literatura Mineira', '10,111,115', 1),
(59, 'Literatura Paraense', '44,174', 1),
(60, 'Literatura Pernambucana', '', 1),
(61, 'Literatura Bahiana', '', 1),
(62, 'Literatura Paranaense', '', 1),
(63, 'Princesa', '98,145', 1),
(64, 'Conto de Fadas', '98,99,100,101,102,103,109,110,131,133,134,135,145,152,153,154,155,156,158', 1),
(65, 'Ficção Científica', '144', 1),
(66, 'Literatura Clássica', '144,145,150,151,159,160,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,191,206,207,7,208', 1),
(67, 'Aventura', '144,150,151,207', 1),
(68, 'Infantil', '147,146,145,148,149', 1),
(69, 'Literatura Carioca', '124,125,126,127,128,123,129,20,79,94,95,108,112,104,116,117,43,105,69,87,84,83,60,59,58,57,56,55,54,72,61,66,76,65,75,71,70,63,68,74,73,64,67,77,81,82,93,88,92,90,89,85,91,118,14,18,17,13,19,16,15,48,190,192,193,194,195,196,199,200,202,203', 1),
(70, 'Literatura Fluminense', '159,161,162,20,79,94,95,108,112,104,116,117,43,105,69,87,84,83,60,59,58,57,56,55,54,72,61,66,76,65,75,71,70,63,68,74,73,64,67,77,81,82,93,88,92,90,89,85,91,118,14,18,17,13,19,16,15,48,176,177,178,179,180,181,182,184,185,187,188,189,208', 1),
(71, 'Romantismo', '7,6,5,4', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tbl_rating`
--

CREATE TABLE `tbl_rating` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ip` varchar(40) NOT NULL,
  `rate` int(11) NOT NULL,
  `dt_rate` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tbl_rating`
--

INSERT INTO `tbl_rating` (`id`, `book_id`, `user_id`, `ip`, `rate`, `dt_rate`) VALUES
(11, 22, 11, '9e3a15042d670ea9', 4, '2018-03-23 10:55:29'),
(12, 22, 6, '9e3a15042d670ea9', 4, '2018-03-23 10:59:13'),
(14, 22, 12, '9e3a15042d670ea9', 4, '2018-03-23 12:15:12'),
(23, 40, 2, '1244', 4, '2018-03-29 10:29:47'),
(25, 49, 6, '9e3a15042d670ea9', 4, '2018-03-29 10:57:53'),
(26, 52, 6, '9e3a15042d670ea9', 4, '2018-03-29 11:46:33'),
(27, 48, 6, '9e3a15042d670ea9', 4, '2018-03-29 12:07:42'),
(28, 49, 10, '6375da2c32482a58', 5, '2018-03-29 12:11:15'),
(31, 27, 6, '9e3a15042d670ea9', 4, '2018-03-30 05:10:47'),
(32, 27, 13, '9e3a15042d670ea9', 3, '2018-03-30 05:25:33'),
(34, 45, 2, '123', 4, '2018-03-30 05:40:18'),
(35, 52, 13, '9e3a15042d670ea9', 4, '2018-03-30 05:55:10'),
(38, 48, 13, '9e3a15042d670ea9', 2, '2018-03-30 05:57:21'),
(40, 31, 13, '9e3a15042d670ea9', 2, '2018-03-30 05:58:18'),
(43, 52, 10, '6375da2c32482a58', 4, '2018-03-30 06:50:01'),
(44, 27, 10, '6375da2c32482a58', 5, '2018-03-30 06:51:00'),
(45, 45, 6, 'b28f34ac41deaa6e', 3, '2018-03-30 07:01:29'),
(46, 44, 6, 'b28f34ac41deaa6e', 4, '2018-03-30 07:04:27'),
(47, 42, 6, 'b28f34ac41deaa6e', 2, '2018-03-30 07:08:31'),
(48, 41, 6, 'b28f34ac41deaa6e', 3, '2018-03-30 07:15:32'),
(49, 40, 6, 'b28f34ac41deaa6e', 1, '2018-03-30 07:19:38'),
(51, 40, 13, '9e3a15042d670ea9', 2, '2018-03-30 07:26:55'),
(54, 49, 126, '', 5, '2021-06-30 13:04:27'),
(55, 42, 126, '', 4, '2021-06-30 13:05:13'),
(57, 52, 126, '', 4, '2021-06-30 13:06:14'),
(60, 81, 185, '', 0, '2021-08-11 06:18:57'),
(61, 74, 197, '', 4, '2021-08-16 05:25:49'),
(62, 79, 200, '', 5, '2021-08-18 08:04:31'),
(63, 81, 200, '', 4, '2021-08-18 09:54:29'),
(64, 96, 254, '', 4, '2021-08-25 20:23:37'),
(65, 96, 262, '', 5, '2021-09-03 17:57:19'),
(67, 93, 317, '', 5, '2021-10-22 22:18:20'),
(68, 81, 327, '', 5, '2021-10-27 17:20:05'),
(69, 75, 327, '', 5, '2021-10-27 17:20:18'),
(70, 93, 344, '', 5, '2021-11-08 15:22:36'),
(71, 117, 350, '', 5, '2021-11-23 05:40:37'),
(72, 118, 357, '', 5, '2021-11-29 00:12:46'),
(74, 78, 374, '', 5, '2022-01-19 14:02:17'),
(75, 96, 379, '', 4, '2022-01-26 09:39:19'),
(80, 137, 485, '', 1, '2022-10-04 09:27:24'),
(81, 136, 485, '', 3, '2022-10-04 09:27:45'),
(82, 0, 484, '', 3, '2022-10-08 13:25:28'),
(85, 0, 485, '', 3, '2022-12-03 06:45:41'),
(86, 41, 485, '12', 5, '2022-12-03 06:57:37'),
(87, 146, 485, '12', 5, '2022-12-03 06:59:55'),
(88, 127, 485, '12', 5, '2022-12-03 07:03:33'),
(90, 138, 485, '', 5, '2022-12-03 07:06:01'),
(92, 139, 485, '', 5, '2022-12-03 07:10:48'),
(96, 145, 485, '', 3, '2023-01-30 08:44:42'),
(97, 141, 485, '', 3, '2023-01-30 08:46:34'),
(99, 74, 538, '', 5, '2023-01-30 09:13:24'),
(100, 91, 538, '', 5, '2023-01-30 09:13:33'),
(101, 92, 538, '', 5, '2023-01-30 09:13:41'),
(102, 152, 541, '', 5, '2023-02-01 07:20:23'),
(105, 150, 550, '', 3, '2023-02-04 13:40:01'),
(106, 145, 550, '', 4, '2023-02-04 13:40:02'),
(107, 0, 544, '', 5, '2023-02-04 17:45:38'),
(108, 137, 571, '', 5, '2023-02-15 06:24:16'),
(109, 136, 571, '', 4, '2023-02-15 06:24:34'),
(110, 89, 571, '', 5, '2023-02-15 06:28:57'),
(111, 133, 571, '', 1, '2023-02-15 06:52:08'),
(112, 130, 571, '', 1, '2023-02-15 06:52:14'),
(114, 141, 571, '', 3, '2023-02-15 06:52:38'),
(115, 145, 571, '', 4, '2023-02-15 06:52:41'),
(116, 150, 571, '', 3, '2023-02-15 06:52:44'),
(117, 121, 571, '', 1, '2023-02-15 06:52:58'),
(118, 95, 569, '', 4, '2023-02-16 20:12:49'),
(129, 153, 521, '', 1, '2023-10-14 16:18:04'),
(130, 152, 521, '', 3, '2023-10-15 20:59:27'),
(131, 146, 521, '', 3, '2023-10-15 20:59:29'),
(132, 97, 521, '', 2, '2023-10-15 20:59:32'),
(134, 4, 773, '', 4, '2025-10-27 13:43:14'),
(135, 8, 773, '', 4, '2025-10-27 13:53:47'),
(140, 7, 776, '', 5, '2025-11-24 12:01:42'),
(143, 35, 773, '', 5, '2026-02-27 18:28:38'),
(144, 46, 782, '', 5, '2026-04-30 20:19:01'),
(145, 149, 788, '', 5, '2026-05-25 19:42:43'),
(146, 4, 783, '', 5, '2026-06-26 12:07:21'),
(147, 28, 783, '', 4, '2026-06-26 12:07:28');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tbl_reading`
--

CREATE TABLE `tbl_reading` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `current_page` int(11) NOT NULL DEFAULT 1,
  `total_pages` int(11) NOT NULL DEFAULT 0,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Despejando dados para a tabela `tbl_reading`
--

INSERT INTO `tbl_reading` (`id`, `user_id`, `book_id`, `current_page`, `total_pages`, `updated_at`) VALUES
(1, 2, 3, 1, 0, '2026-02-27 13:12:07'),
(2, 2, 3, 1, 0, '2026-02-27 13:12:07'),
(3, 185, 88, 1, 0, '2026-02-27 13:12:07'),
(4, 191, 75, 1, 0, '2026-02-27 13:12:07'),
(5, 193, 81, 1, 0, '2026-02-27 13:12:07'),
(6, 197, 81, 1, 0, '2026-02-27 13:12:07'),
(7, 200, 74, 1, 0, '2026-02-27 13:12:07'),
(8, 194, 80, 1, 0, '2026-02-27 13:12:07'),
(9, 205, 85, 1, 0, '2026-02-27 13:12:07'),
(10, 150, 88, 1, 0, '2026-02-27 13:12:07'),
(11, 209, 76, 1, 0, '2026-02-27 13:12:07'),
(12, 211, 76, 1, 0, '2026-02-27 13:12:07'),
(13, 212, 76, 1, 0, '2026-02-27 13:12:07'),
(14, 217, 76, 1, 0, '2026-02-27 13:12:07'),
(15, 218, 79, 1, 0, '2026-02-27 13:12:07'),
(16, 227, 79, 1, 0, '2026-02-27 13:12:07'),
(17, 228, 97, 1, 0, '2026-02-27 13:12:07'),
(18, 229, 76, 1, 0, '2026-02-27 13:12:07'),
(19, 231, 79, 1, 0, '2026-02-27 13:12:07'),
(20, 233, 81, 1, 0, '2026-02-27 13:12:07'),
(21, 235, 79, 1, 0, '2026-02-27 13:12:07'),
(22, 242, 76, 1, 0, '2026-02-27 13:12:07'),
(23, 248, 97, 1, 0, '2026-02-27 13:12:07'),
(24, 251, 97, 1, 0, '2026-02-27 13:12:07'),
(25, 253, 76, 1, 0, '2026-02-27 13:12:07'),
(26, 254, 81, 1, 0, '2026-02-27 13:12:07'),
(27, 139, 96, 1, 0, '2026-02-27 13:12:07'),
(28, 255, 98, 1, 0, '2026-02-27 13:12:07'),
(29, 256, 90, 1, 0, '2026-02-27 13:12:07'),
(30, 257, 74, 1, 0, '2026-02-27 13:12:07'),
(31, 258, 78, 1, 0, '2026-02-27 13:12:07'),
(32, 260, 78, 1, 0, '2026-02-27 13:12:07'),
(33, 262, 79, 1, 0, '2026-02-27 13:12:07'),
(34, 263, 81, 1, 0, '2026-02-27 13:12:07'),
(35, 264, 102, 1, 0, '2026-02-27 13:12:07'),
(36, 265, 102, 1, 0, '2026-02-27 13:12:07'),
(37, 270, 103, 1, 0, '2026-02-27 13:12:07'),
(38, 271, 74, 1, 0, '2026-02-27 13:12:07'),
(39, 272, 98, 1, 0, '2026-02-27 13:12:07'),
(40, 274, 74, 1, 0, '2026-02-27 13:12:07'),
(41, 273, 104, 1, 0, '2026-02-27 13:12:07'),
(42, 275, 81, 1, 0, '2026-02-27 13:12:07'),
(43, 277, 104, 1, 0, '2026-02-27 13:12:07'),
(44, 279, 75, 1, 0, '2026-02-27 13:12:07'),
(45, 280, 74, 1, 0, '2026-02-27 13:12:07'),
(46, 281, 80, 1, 0, '2026-02-27 13:12:07'),
(47, 282, 81, 1, 0, '2026-02-27 13:12:07'),
(48, 283, 89, 1, 0, '2026-02-27 13:12:07'),
(49, 284, 105, 1, 0, '2026-02-27 13:12:07'),
(50, 138, 79, 1, 0, '2026-02-27 13:12:07'),
(51, 285, 79, 1, 0, '2026-02-27 13:12:07'),
(52, 287, 102, 1, 0, '2026-02-27 13:12:07'),
(53, 288, 102, 1, 0, '2026-02-27 13:12:07'),
(54, 289, 98, 1, 0, '2026-02-27 13:12:07'),
(55, 290, 103, 1, 0, '2026-02-27 13:12:07'),
(56, 291, 85, 1, 0, '2026-02-27 13:12:07'),
(57, 295, 103, 1, 0, '2026-02-27 13:12:07'),
(58, 296, 105, 1, 0, '2026-02-27 13:12:07'),
(59, 297, 75, 1, 0, '2026-02-27 13:12:07'),
(60, 300, 105, 1, 0, '2026-02-27 13:12:07'),
(61, 299, 76, 1, 0, '2026-02-27 13:12:07'),
(62, 301, 102, 1, 0, '2026-02-27 13:12:07'),
(63, 302, 81, 1, 0, '2026-02-27 13:12:07'),
(64, 298, 105, 1, 0, '2026-02-27 13:12:07'),
(65, 303, 104, 1, 0, '2026-02-27 13:12:07'),
(66, 314, 81, 1, 0, '2026-02-27 13:12:07'),
(67, 317, 93, 1, 0, '2026-02-27 13:12:07'),
(68, 318, 76, 1, 0, '2026-02-27 13:12:07'),
(69, 319, 104, 1, 0, '2026-02-27 13:12:07'),
(70, 320, 78, 1, 0, '2026-02-27 13:12:07'),
(71, 321, 81, 1, 0, '2026-02-27 13:12:07'),
(72, 322, 96, 1, 0, '2026-02-27 13:12:07'),
(73, 323, 79, 1, 0, '2026-02-27 13:12:07'),
(74, 324, 116, 1, 0, '2026-02-27 13:12:07'),
(75, 327, 119, 1, 0, '2026-02-27 13:12:07'),
(76, 328, 81, 1, 0, '2026-02-27 13:12:07'),
(77, 329, 96, 1, 0, '2026-02-27 13:12:07'),
(78, 330, 76, 1, 0, '2026-02-27 13:12:07'),
(79, 332, 113, 1, 0, '2026-02-27 13:12:07'),
(80, 333, 115, 1, 0, '2026-02-27 13:12:07'),
(81, 334, 104, 1, 0, '2026-02-27 13:12:07'),
(82, 335, 76, 1, 0, '2026-02-27 13:12:07'),
(83, 337, 93, 1, 0, '2026-02-27 13:12:07'),
(84, 292, 74, 1, 0, '2026-02-27 13:12:07'),
(85, 338, 115, 1, 0, '2026-02-27 13:12:07'),
(86, 340, 74, 1, 0, '2026-02-27 13:12:07'),
(87, 342, 83, 1, 0, '2026-02-27 13:12:07'),
(88, 343, 75, 1, 0, '2026-02-27 13:12:07'),
(89, 344, 76, 1, 0, '2026-02-27 13:12:07'),
(90, 346, 94, 1, 0, '2026-02-27 13:12:07'),
(91, 348, 75, 1, 0, '2026-02-27 13:12:07'),
(92, 349, 77, 1, 0, '2026-02-27 13:12:07'),
(93, 350, 75, 1, 0, '2026-02-27 13:12:07'),
(94, 352, 75, 1, 0, '2026-02-27 13:12:07'),
(95, 353, 79, 1, 0, '2026-02-27 13:12:07'),
(96, 354, 118, 1, 0, '2026-02-27 13:12:07'),
(97, 347, 75, 1, 0, '2026-02-27 13:12:07'),
(98, 355, 118, 1, 0, '2026-02-27 13:12:07'),
(99, 357, 74, 1, 0, '2026-02-27 13:12:07'),
(100, 358, 118, 1, 0, '2026-02-27 13:12:07'),
(101, 359, 79, 1, 0, '2026-02-27 13:12:07'),
(102, 360, 77, 1, 0, '2026-02-27 13:12:07'),
(103, 361, 98, 1, 0, '2026-02-27 13:12:07'),
(104, 362, 109, 1, 0, '2026-02-27 13:12:07'),
(105, 363, 80, 1, 0, '2026-02-27 13:12:07'),
(106, 364, 78, 1, 0, '2026-02-27 13:12:07'),
(107, 365, 104, 1, 0, '2026-02-27 13:12:07'),
(108, 366, 74, 1, 0, '2026-02-27 13:12:07'),
(109, 367, 116, 1, 0, '2026-02-27 13:12:07'),
(110, 368, 85, 1, 0, '2026-02-27 13:12:07'),
(111, 371, 115, 1, 0, '2026-02-27 13:12:07'),
(112, 374, 78, 1, 0, '2026-02-27 13:12:07'),
(113, 377, 96, 1, 0, '2026-02-27 13:12:07'),
(114, 378, 97, 1, 0, '2026-02-27 13:12:07'),
(115, 379, 74, 1, 0, '2026-02-27 13:12:07'),
(116, 373, 97, 1, 0, '2026-02-27 13:12:07'),
(117, 380, 96, 1, 0, '2026-02-27 13:12:07'),
(118, 381, 122, 1, 0, '2026-02-27 13:12:07'),
(119, 387, 76, 1, 0, '2026-02-27 13:12:07'),
(120, 388, 95, 1, 0, '2026-02-27 13:12:07'),
(121, 389, 74, 1, 0, '2026-02-27 13:12:07'),
(122, 391, 79, 1, 0, '2026-02-27 13:12:07'),
(123, 395, 88, 1, 0, '2026-02-27 13:12:07'),
(124, 397, 92, 1, 0, '2026-02-27 13:12:07'),
(125, 407, 121, 1, 0, '2026-02-27 13:12:07'),
(126, 415, 123, 1, 0, '2026-02-27 13:12:07'),
(127, 417, 123, 1, 0, '2026-02-27 13:12:07'),
(128, 419, 126, 1, 0, '2026-02-27 13:12:07'),
(129, 421, 127, 1, 0, '2026-02-27 13:12:07'),
(130, 423, 74, 1, 0, '2026-02-27 13:12:07'),
(131, 410, 125, 1, 0, '2026-02-27 13:12:07'),
(132, 425, 127, 1, 0, '2026-02-27 13:12:07'),
(133, 426, 126, 1, 0, '2026-02-27 13:12:07'),
(134, 427, 126, 1, 0, '2026-02-27 13:12:07'),
(135, 428, 126, 1, 0, '2026-02-27 13:12:07'),
(136, 429, 125, 1, 0, '2026-02-27 13:12:07'),
(137, 430, 127, 1, 0, '2026-02-27 13:12:07'),
(138, 433, 125, 1, 0, '2026-02-27 13:12:07'),
(139, 436, 125, 1, 0, '2026-02-27 13:12:07'),
(140, 438, 121, 1, 0, '2026-02-27 13:12:07'),
(141, 440, 130, 1, 0, '2026-02-27 13:12:07'),
(142, 442, 131, 1, 0, '2026-02-27 13:12:07'),
(143, 443, 131, 1, 0, '2026-02-27 13:12:07'),
(144, 444, 131, 1, 0, '2026-02-27 13:12:07'),
(145, 446, 127, 1, 0, '2026-02-27 13:12:07'),
(146, 447, 126, 1, 0, '2026-02-27 13:12:07'),
(147, 449, 121, 1, 0, '2026-02-27 13:12:07'),
(148, 450, 132, 1, 0, '2026-02-27 13:12:07'),
(149, 451, 132, 1, 0, '2026-02-27 13:12:07'),
(150, 452, 121, 1, 0, '2026-02-27 13:12:07'),
(151, 455, 140, 1, 0, '2026-02-27 13:12:07'),
(152, 457, 133, 1, 0, '2026-02-27 13:12:07'),
(153, 462, 95, 1, 0, '2026-02-27 13:12:07'),
(154, 463, 127, 1, 0, '2026-02-27 13:12:07'),
(155, 466, 133, 1, 0, '2026-02-27 13:12:07'),
(156, 468, 141, 1, 0, '2026-02-27 13:12:07'),
(157, 469, 140, 1, 0, '2026-02-27 13:12:07'),
(158, 467, 130, 1, 0, '2026-02-27 13:12:07'),
(159, 489, 88, 1, 0, '2026-02-27 13:12:07'),
(160, 490, 74, 1, 0, '2026-02-27 13:12:07'),
(161, 491, 77, 1, 0, '2026-02-27 13:12:07'),
(162, 0, 152, 1, 0, '2026-02-27 13:12:07'),
(166, 773, 28, 3, 35, '2026-07-06 11:43:04'),
(167, 775, 19, 7, 9, '2026-03-02 14:25:12'),
(168, 775, 15, 1, 0, '2026-03-02 14:25:37'),
(169, 775, 13, 25, 27, '2026-03-02 14:26:22'),
(170, 775, 35, 128, 171, '2026-03-02 14:27:14'),
(171, 775, 9, 8, 316, '2026-03-02 14:57:34'),
(172, 773, 18, 14, 25, '2026-03-02 15:02:56'),
(173, 773, 4, 98, 180, '2026-03-02 15:08:31'),
(174, 775, 52, 1, 0, '2026-03-02 20:38:59'),
(175, 775, 53, 1, 0, '2026-03-03 14:49:43'),
(176, 775, 20, 5, 145, '2026-03-06 17:16:52'),
(177, 778, 9, 4, 316, '2026-03-12 20:38:17'),
(178, 779, 82, 10, 72, '2026-03-17 14:56:21'),
(179, 779, 86, 1, 170, '2026-03-31 15:56:08'),
(180, 773, 44, 5, 40, '2026-04-22 11:54:02'),
(181, 779, 78, 1, 0, '2026-03-31 15:55:37'),
(182, 779, 6, 1, 0, '2026-03-31 15:58:43'),
(183, 779, 97, 1, 0, '2026-03-31 15:59:54'),
(184, 781, 77, 1, 184, '2026-04-09 19:03:09'),
(185, 773, 52, 1, 0, '2026-04-09 19:10:31'),
(186, 773, 40, 3, 46, '2026-04-09 19:11:12'),
(187, 773, 38, 3, 71, '2026-04-09 19:11:26'),
(188, 773, 26, 3, 148, '2026-04-09 19:11:59'),
(189, 780, 89, 18, 399, '2026-04-09 20:58:30'),
(190, 781, 86, 2, 170, '2026-04-13 17:56:01'),
(191, 781, 45, 3, 105, '2026-04-13 17:57:14'),
(192, 779, 45, 3, 105, '2026-04-23 19:00:19'),
(193, 773, 25, 1, 0, '2026-04-24 12:10:04'),
(195, 780, 23, 1, 11, '2026-04-30 11:52:55'),
(196, 780, 22, 3, 28, '2026-04-30 11:53:07'),
(197, 780, 27, 3, 178, '2026-04-30 11:53:20'),
(198, 780, 78, 1, 203, '2026-04-30 11:53:43'),
(199, 780, 107, 1, 255, '2026-04-30 11:54:02'),
(200, 780, 43, 1, 423, '2026-04-30 11:54:29'),
(201, 780, 71, 1, 120, '2026-04-30 11:54:59'),
(202, 780, 77, 1, 184, '2026-04-30 11:55:13'),
(203, 780, 20, 1, 145, '2026-04-30 11:55:37'),
(205, 780, 19, 1, 9, '2026-04-30 11:56:00'),
(207, 780, 106, 1, 78, '2026-04-30 11:56:40'),
(208, 780, 15, 3, 29, '2026-04-30 11:56:55'),
(209, 780, 13, 3, 27, '2026-04-30 11:57:11'),
(210, 780, 18, 2, 25, '2026-04-30 18:10:22'),
(211, 780, 86, 1, 170, '2026-04-30 13:16:38'),
(212, 780, 52, 3, 523, '2026-04-30 13:17:47'),
(213, 780, 109, 2, 10, '2026-04-30 18:02:46'),
(214, 780, 110, 3, 19, '2026-04-30 18:02:57'),
(215, 780, 25, 1, 73, '2026-04-30 18:05:43'),
(217, 782, 47, 1, 81, '2026-04-30 20:17:15'),
(218, 782, 32, 3, 364, '2026-04-30 20:17:29'),
(219, 782, 12, 3, 132, '2026-04-30 20:17:59'),
(220, 782, 75, 3, 130, '2026-04-30 20:18:23'),
(221, 779, 114, 12, 670, '2026-04-30 20:36:46'),
(222, 782, 17, 1, 15, '2026-05-05 12:16:13'),
(223, 782, 106, 2, 78, '2026-05-05 12:16:21'),
(224, 782, 18, 1, 25, '2026-05-05 12:16:28'),
(225, 782, 80, 1, 109, '2026-05-05 12:16:48'),
(226, 782, 69, 1, 300, '2026-05-05 12:17:10'),
(227, 773, 22, 20, 28, '2026-05-05 18:06:22'),
(228, 784, 8, 11, 26, '2026-05-05 18:23:45'),
(229, 784, 81, 10, 14, '2026-05-05 18:24:26'),
(230, 784, 73, 15, 31, '2026-05-05 19:50:39'),
(232, 784, 107, 13, 255, '2026-05-06 00:15:10'),
(233, 784, 77, 1, 184, '2026-05-26 11:45:30'),
(234, 784, 108, 1, 0, '2026-05-06 13:24:05'),
(235, 784, 62, 1, 0, '2026-05-26 11:46:46'),
(236, 784, 78, 1, 0, '2026-05-06 13:25:15'),
(237, 782, 92, 2, 78, '2026-05-06 20:27:12'),
(238, 782, 16, 2, 111, '2026-05-06 20:28:17'),
(239, 782, 31, 1, 0, '2026-05-06 20:29:03'),
(240, 782, 56, 1, 0, '2026-05-06 20:29:44'),
(241, 784, 92, 4, 78, '2026-05-07 12:18:24'),
(242, 779, 9, 9, 316, '2026-05-09 16:32:48'),
(243, 779, 22, 1, 28, '2026-05-09 16:33:21'),
(244, 782, 102, 1, 0, '2026-05-12 12:27:17'),
(245, 782, 100, 1, 14, '2026-05-12 12:28:05'),
(246, 784, 150, 1, 126, '2026-05-26 11:43:13'),
(247, 782, 145, 1, 41, '2026-05-15 19:31:19'),
(248, 785, 150, 1, 126, '2026-05-16 19:55:20'),
(249, 786, 150, 9, 126, '2026-05-16 20:24:28'),
(250, 784, 146, 9, 22, '2026-05-20 20:27:35'),
(251, 784, 24, 6, 140, '2026-05-20 20:41:45'),
(252, 784, 76, 2, 78, '2026-05-20 20:42:11'),
(253, 784, 119, 8, 54, '2026-05-22 13:10:42'),
(254, 787, 146, 17, 22, '2026-05-22 17:58:43'),
(255, 787, 145, 39, 41, '2026-05-22 16:40:44'),
(256, 787, 156, 4, 16, '2026-05-24 16:23:00'),
(258, 787, 148, 4, 7, '2026-05-24 16:24:54'),
(260, 787, 150, 4, 126, '2026-05-24 15:16:29'),
(263, 787, 149, 6, 13, '2026-05-25 19:04:03'),
(264, 784, 151, 2, 133, '2026-05-26 11:43:04'),
(265, 784, 28, 1, 0, '2026-05-26 11:44:23'),
(266, 784, 106, 1, 0, '2026-05-26 11:45:48'),
(267, 789, 106, 19, 78, '2026-06-26 13:02:25'),
(268, 789, 141, 2, 252, '2026-05-27 19:28:55'),
(269, 789, 23, 1, 0, '2026-05-27 19:29:13'),
(270, 789, 150, 5, 126, '2026-05-27 19:30:06'),
(271, 789, 158, 1, 9, '2026-05-27 19:32:07'),
(272, 789, 153, 1, 9, '2026-05-27 19:33:01'),
(273, 787, 159, 24, 281, '2026-06-06 22:23:04'),
(274, 789, 160, 35, 114, '2026-06-09 14:03:56'),
(275, 789, 149, 8, 13, '2026-06-09 18:41:08'),
(276, 789, 154, 1, 0, '2026-06-09 18:41:30'),
(277, 789, 122, 1, 286, '2026-06-25 17:35:58'),
(281, 783, 160, 16, 114, '2026-07-24 19:11:38'),
(282, 783, 149, 10, 13, '2026-06-26 13:02:21'),
(283, 783, 58, 1, 0, '2026-07-24 19:10:16'),
(284, 783, 65, 56, 199, '2026-06-26 13:17:27'),
(285, 779, 44, 17, 40, '2026-06-30 19:21:30'),
(286, 789, 116, 2, 118, '2026-07-03 14:35:23'),
(287, 773, 35, 6, 171, '2026-07-03 19:01:21'),
(288, 773, 15, 20, 29, '2026-07-06 02:58:58'),
(295, 773, 24, 115, 140, '2026-07-06 17:59:20'),
(296, 788, 162, 3, 63, '2026-07-16 12:49:58'),
(297, 788, 129, 1, 58, '2026-07-15 14:52:41'),
(298, 783, 126, 109, 135, '2026-07-15 12:54:20'),
(299, 783, 118, 62, 267, '2026-07-15 12:54:36'),
(300, 783, 29, 7, 13, '2026-07-15 12:56:27'),
(301, 788, 145, 3, 41, '2026-07-27 20:26:15'),
(302, 788, 118, 4, 267, '2026-07-22 18:33:22'),
(303, 788, 25, 3, 73, '2026-07-16 13:07:56'),
(304, 788, 42, 8, 14, '2026-07-22 18:27:15'),
(307, 788, 159, 3, 281, '2026-07-17 14:22:27'),
(308, 788, 175, 3, 8, '2026-07-22 20:39:37'),
(309, 788, 146, 6, 22, '2026-07-22 18:32:53'),
(312, 783, 147, 2, 11, '2026-07-22 20:18:58'),
(313, 788, 176, 1, 27, '2026-07-23 13:34:01'),
(314, 783, 162, 6, 63, '2026-07-24 19:04:49'),
(316, 788, 206, 103, 104, '2026-08-13 19:35:55'),
(317, 788, 73, 1, 0, '2026-07-31 19:57:34'),
(318, 779, 176, 21, 27, '2026-08-03 17:07:14'),
(320, 788, 190, 3, 4, '2026-08-17 20:12:54'),
(321, 788, 115, 3, 295, '2026-08-17 20:13:39'),
(322, 773, 10, 2, 166, '2026-08-27 13:24:11'),
(323, 773, 161, 1, 216, '2026-08-27 13:26:19'),
(325, 773, 198, 1, 4, '2026-08-27 13:30:21'),
(326, 773, 206, 66, 104, '2026-08-27 13:30:39');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tbl_settings`
--

CREATE TABLE `tbl_settings` (
  `id` int(11) NOT NULL,
  `app_name` varchar(255) NOT NULL,
  `onesignal_rest_key` text DEFAULT NULL,
  `onesignal_app_id` text DEFAULT NULL,
  `app_logo` varchar(255) NOT NULL,
  `app_email` varchar(255) NOT NULL,
  `app_version` varchar(255) NOT NULL,
  `app_author` varchar(255) NOT NULL,
  `app_contact` varchar(255) NOT NULL,
  `app_website` varchar(255) NOT NULL,
  `app_description` text NOT NULL,
  `api_latest_limit` int(3) NOT NULL,
  `api_cat_order_by` varchar(255) NOT NULL,
  `api_cat_post_order_by` varchar(255) NOT NULL,
  `api_author_order_by` varchar(255) NOT NULL,
  `api_author_post_order_by` varchar(255) NOT NULL,
  `app_privacy_policy` text NOT NULL,
  `publisher_id` varchar(255) NOT NULL,
  `interstital_ad_id` varchar(255) NOT NULL,
  `interstital_ad_id_status` int(11) NOT NULL DEFAULT 1,
  `banner_ad_id` varchar(255) NOT NULL,
  `banner_ad_id_status` int(11) NOT NULL DEFAULT 1,
  `interstital_ad_id_ios` varchar(255) NOT NULL,
  `interstital_ad_id_ios_status` int(11) NOT NULL DEFAULT 1,
  `banner_ad_id_ios` varchar(255) NOT NULL,
  `banner_ad_id_ios_status` int(11) NOT NULL DEFAULT 1,
  `app_open_ad_id` varchar(255) NOT NULL,
  `app_open_ad_id_status` int(11) NOT NULL DEFAULT 1,
  `ios_app_open_ad_id` varchar(255) NOT NULL,
  `ios_app_open_ad_id_status` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `tbl_settings`
--

INSERT INTO `tbl_settings` (`id`, `app_name`, `onesignal_rest_key`, `onesignal_app_id`, `app_logo`, `app_email`, `app_version`, `app_author`, `app_contact`, `app_website`, `app_description`, `api_latest_limit`, `api_cat_order_by`, `api_cat_post_order_by`, `api_author_order_by`, `api_author_post_order_by`, `app_privacy_policy`, `publisher_id`, `interstital_ad_id`, `interstital_ad_id_status`, `banner_ad_id`, `banner_ad_id_status`, `interstital_ad_id_ios`, `interstital_ad_id_ios_status`, `banner_ad_id_ios`, `banner_ad_id_ios_status`, `app_open_ad_id`, `app_open_ad_id_status`, `ios_app_open_ad_id`, `ios_app_open_ad_id_status`) VALUES
(1, 'ADM Painel', 'MDkwNTM3NDYtOGFjMS00MGY1LThmM2EtMTVjMmE1NTIyZGIy', '331a8c6c-3c1e-45e9-b012-049ff5f26e68', '1234.png', 'adm@alenxandriaglobaltec.com', '1.0', 'Globaltec Educacional', '+ 55 98 99164-5692', 'alexandriaglobaltec.com.br', '&amp;lt;p&amp;gt;Nos contate em :DTI@globalteceducacional.com&amp;lt;/p&amp;gt;', 12, 'ASC', 'DESC', 'author_name', '', '&lt;h2&gt;Pol&iacute;tica de Privacidade&lt;/h2&gt;\n\n&lt;p&gt;A Globaltec Tecnologias Educacionais disponibiliza&nbsp;o aplicativo de livros aqui a vista.&lt;/p&gt;\n\n&lt;p&gt;Esta p&aacute;gina &eacute; usada para informar os visitantes sobre nossas pol&iacute;ticas relativas &agrave; coleta, uso e divulga&ccedil;&atilde;o de informa&ccedil;&otilde;es pessoais, caso algu&eacute;m decida usar nosso Servi&ccedil;o.&lt;/p&gt;\n\n&lt;p&gt;Se voc&ecirc; optar por usar nosso Servi&ccedil;o, concorda com a coleta e uso de informa&ccedil;&otilde;es em rela&ccedil;&atilde;o a esta pol&iacute;tica. As informa&ccedil;&otilde;es pessoais que coletamos s&atilde;o usadas para fornecer e melhorar o Servi&ccedil;o. N&atilde;o usaremos ou compartilharemos suas informa&ccedil;&otilde;es com ningu&eacute;m, exceto conforme descrito nesta Pol&iacute;tica de Privacidade.&lt;/p&gt;\n\n&lt;p&gt;Os termos usados nesta Pol&iacute;tica de Privacidade t&ecirc;m os mesmos significados que em nossos Termos e Condi&ccedil;&otilde;es, acess&iacute;veis no aplicativo de livros, a menos que definido de outra forma nesta Pol&iacute;tica de Privacidade.&lt;/p&gt;\n\n&lt;p&gt;&lt;strong&gt;Coleta e Uso de Informa&ccedil;&otilde;es&lt;/strong&gt;&lt;/p&gt;\n\n&lt;p&gt;Para uma melhor experi&ecirc;ncia ao usar nosso Servi&ccedil;o, podemos solicitar que voc&ecirc; nos forne&ccedil;a certas informa&ccedil;&otilde;es de identifica&ccedil;&atilde;o pessoal, incluindo, mas n&atilde;o se limitando a nome, endere&ccedil;o, n&uacute;mero de telefone. As informa&ccedil;&otilde;es que solicitamos ser&atilde;o retidas por n&oacute;s e usadas conforme descrito nesta pol&iacute;tica de privacidade.&lt;/p&gt;\n\n&lt;p&gt;O aplicativo usa servi&ccedil;os de terceiros que podem coletar informa&ccedil;&otilde;es usadas para identific&aacute;-lo.&lt;/p&gt;\n\n&lt;p&gt;&lt;strong&gt;Links para Sites de Terceiros&lt;/strong&gt;&lt;/p&gt;\n\n&lt;p&gt;Este servi&ccedil;o pode conter links para outros sites. Se voc&ecirc; clicar em um link de terceiros, voc&ecirc; ser&aacute; direcionado para esse site. Observe que esses sites externos n&atilde;o s&atilde;o operados por n&oacute;s. Portanto, recomendamos fortemente que voc&ecirc; revise a Pol&iacute;tica de Privacidade desses sites. N&atilde;o temos controle e n&atilde;o assumimos responsabilidade pelo conte&uacute;do, pol&iacute;ticas de privacidade ou pr&aacute;ticas de qualquer site ou servi&ccedil;o de terceiros.&lt;/p&gt;\n\n&lt;p&gt;&lt;strong&gt;Seguran&ccedil;a&lt;/strong&gt;&lt;/p&gt;\n\n&lt;p&gt;Valorizamos sua confian&ccedil;a ao nos fornecer suas informa&ccedil;&otilde;es pessoais. Assim, estamos empenhados em proteger essas informa&ccedil;&otilde;es. Mas lembre-se de que nenhum m&eacute;todo de transmiss&atilde;o pela internet ou m&eacute;todo de armazenamento eletr&ocirc;nico &eacute; 100%&nbsp;seguro e confi&aacute;vel, e n&atilde;o podemos garantir sua seguran&ccedil;a absoluta. Mas operamos com os protocolos exigidos pelo LGPD e sistema b&aacute;sico de prodte&ccedil;&atilde;o, assim como outros apps similares.&lt;/p&gt;\n\n&lt;p&gt;&lt;strong&gt;Altera&ccedil;&otilde;es a esta Pol&iacute;tica de Privacidade&lt;/strong&gt;&lt;/p&gt;\n\n&lt;p&gt;Podemos atualizar nossa Pol&iacute;tica de Privacidade periodicamente. Portanto, recomendamos que voc&ecirc; revise esta p&aacute;gina periodicamente para quaisquer altera&ccedil;&otilde;es. Iremos notific&aacute;-lo de quaisquer altera&ccedil;&otilde;es postando a nova Pol&iacute;tica de Privacidade nesta p&aacute;gina.&lt;/p&gt;\n\n&lt;p&gt;Esta pol&iacute;tica &eacute; eficaz a partir de 1 de janeiro de 2024.&lt;/p&gt;\n\n&lt;p&gt;&lt;strong&gt;Contate-nos&lt;/strong&gt;&lt;/p&gt;\n\n&lt;p&gt;Se voc&ecirc; tiver alguma d&uacute;vida ou sugest&atilde;o sobre nossa Pol&iacute;tica de Privacidade, n&atilde;o hesite em nos contatar em &lt;a&gt;dti@globalteceducacional.com&lt;/a&gt;&lt;/p&gt;', 'pub-9456493320432553', '/6499/example/interstitial', 0, '/6499/example/banner', 0, 'ca-app-pub-3940256099942544/4411468910', 0, 'ca-app-pub-3940256099942544/2934735716', 0, '', 0, 'ca-app-pub-3940256099942544/5662855259', 0);

-- --------------------------------------------------------

--
-- Estrutura para tabela `tbl_users`
--

CREATE TABLE `tbl_users` (
  `id` int(11) NOT NULL,
  `user_type` varchar(255) NOT NULL,
  `user_image` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `auth_id` varchar(255) NOT NULL,
  `is_deleted` int(1) NOT NULL DEFAULT 0,
  `registered_on` varchar(200) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT '1',
  `acervo_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `tbl_users`
--

INSERT INTO `tbl_users` (`id`, `user_type`, `user_image`, `name`, `email`, `password`, `phone`, `auth_id`, `is_deleted`, `registered_on`, `status`, `acervo_id`, `created_at`) VALUES
(773, 'Normal', '95347_profile_1786043392407.jpg', 'Luis', 'lluisrodrigo2@gmail.com', '$2y$10$lhPS19zSVc4ede5NN6iomuVc40lLfU3X2tRXecoajLfEFcebfvXpy', '', '', 0, '1741273968', '1', 1, '2025-03-06 15:12:48'),
(776, 'Normal', '10766_scaled_1000226710.jpg', 'Karoline Amaral', 'koraline.amaral@gmail.com', 'Salada06', 'Salada06', '', 0, '1761577294', '1', 1, '2025-10-27 15:01:34'),
(779, 'Normal', '27945_profile_1773681823297.jpg', 'Claudia', 'claudiapolliny38@gmail.com', 'P2306', '', '', 0, '1773681737', '1', NULL, '2026-03-16 17:22:17'),
(780, 'Normal', '', 'Karoline', 'krl.amaral06@gmail.com', 'Salada12', '', '', 0, '1775746684', '1', NULL, '2026-04-09 14:58:04'),
(781, 'Normal', '', 'Afonso Ada Costa de Lima', 'afonsoengsoftware@gmail.com', '26052018', '98983376349', '', 0, '1775760959', '1', NULL, '2026-04-09 18:55:59'),
(782, 'Normal', '', 'Karoline Amaral', 'karoline.amaral.correa@gmail.com', 'Amaral06', '98985897745', '', 0, '1777580135', '1', NULL, '2026-04-30 20:15:35'),
(783, 'Normal', '22968_Ícone-Professor.png', 'Paulo Rabelo', 'rabelo.paulo@gmail.com', '$2y$10$cGhJVf0Z3FfAD4wAKehod.l9A8OX9FMsXeICJpkdtU/l6EyftJ8tK', '', '', 0, '1778003717', '1', NULL, '2026-05-05 17:55:17'),
(784, 'Normal', '', 'globaltec', 'globaltec@globaltec.com', '123456', '', '', 0, '1778005375', '1', NULL, '2026-05-05 18:22:55'),
(785, 'Normal', '', 'Marlon Daniel Ferreira Verde', 'themarlonv@outlook.com', 'Betoven07', '', '', 0, '1778961085', '1', NULL, '2026-05-16 19:51:25'),
(786, 'Normal', '', 'Nicoly', 'acervo1001@gmail.com', 'En130200', '', '', 0, '1778962725', '1', NULL, '2026-05-16 20:18:45'),
(787, 'Normal', '', 'Frederico', 'frederico@globaltec.com', '123456', '', '', 0, '1779367503', '1', NULL, '2026-05-21 12:45:03'),
(788, 'Normal', '', 'Alexandre', 'alexandrereismoraes9@gmail.com', 'ALEXANDRE2007', '98981986040', '', 0, '1779738047', '1', NULL, '2026-05-25 19:40:47'),
(789, 'Normal', '', 'Korinha', 'globaltecestagiario@gmail.com', 'Salada06', '98985897745', '', 0, '1779910052', '1', NULL, '2026-05-27 19:27:32'),
(790, 'Normal', '53542_field_trees_clouds_1589121_1920x1080.jpg', 'teste', 'teste@gmail.com', '$argon2i$v=19$m=65536,t=4,p=1$L1pvQ1dobXNQZ3J5aXZyaQ$QpNe2BsEqMzY1pefRdbv2XqrPZLnUPRQdfVd9bU0m+8', '123', '', 0, '1784317902', '1', NULL, '2026-07-17 19:51:42'),
(791, 'Normal', '75111_&Iacute;cone-Professor.png', 'fapema', 'fapema@globaltec.com', '$2y$10$L27iQZ.JhTbq5SAcYdfSyeieQLcLn/KAhMGqhG/89.uRf0HmGgV02', '98984039343', '', 0, '1785441855', '1', NULL, '2026-07-30 20:04:15'),
(792, 'Normal', '', 'Diego Silva Barros', 'diego.silva19yahoo77@gmail.com', '$2y$10$PCd4FVfspG7sco0iYymiGuK2FSx7szctltNLiogm9a9anO8Mg7y/6', '', '', 0, '1788372089', '1', NULL, '2026-09-02 18:01:29');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tbl_version`
--

CREATE TABLE `tbl_version` (
  `vid` int(11) NOT NULL,
  `version_code` varchar(255) NOT NULL,
  `version_messages` varchar(255) NOT NULL,
  `version_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Despejando dados para a tabela `tbl_version`
--

INSERT INTO `tbl_version` (`vid`, `version_code`, `version_messages`, `version_url`) VALUES
(1, '2', 'New Update Available please download it.', 'https://www.google.co.in/');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tbl_wishlist`
--

CREATE TABLE `tbl_wishlist` (
  `id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `tbl_wishlist`
--

INSERT INTO `tbl_wishlist` (`id`, `book_id`, `user_id`) VALUES
(6, 46, 775),
(7, 4, 773),
(9, 4, 780),
(10, 62, 784),
(11, 76, 784);

-- --------------------------------------------------------

--
-- Estrutura para tabela `vizualização_jogo`
--

CREATE TABLE `vizualização_jogo` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `vizualização_site`
--

CREATE TABLE `vizualização_site` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `acervos`
--
ALTER TABLE `acervos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome_unique` (`nome`);

--
-- Índices de tabela `Autores_jogo`
--
ALTER TABLE `Autores_jogo`
  ADD PRIMARY KEY (`author_id`);

--
-- Índices de tabela `Autores_site`
--
ALTER TABLE `Autores_site`
  ADD PRIMARY KEY (`author_id`);

--
-- Índices de tabela `Categoría_jogo`
--
ALTER TABLE `Categoría_jogo`
  ADD PRIMARY KEY (`cid`);

--
-- Índices de tabela `Categoría_site`
--
ALTER TABLE `Categoría_site`
  ADD PRIMARY KEY (`cid`);

--
-- Índices de tabela `Comentarios_jogo`
--
ALTER TABLE `Comentarios_jogo`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `Comentarios_site`
--
ALTER TABLE `Comentarios_site`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `Jogos`
--
ALTER TABLE `Jogos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `livros_acervos`
--
ALTER TABLE `livros_acervos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `book_acervo_unique` (`book_id`,`acervo_id`),
  ADD KEY `idx_book_id` (`book_id`),
  ADD KEY `idx_acervo_id` (`acervo_id`);

--
-- Índices de tabela `rating_jogos`
--
ALTER TABLE `rating_jogos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `rating_sites`
--
ALTER TABLE `rating_sites`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `Seções_jogo`
--
ALTER TABLE `Seções_jogo`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `Seções_site`
--
ALTER TABLE `Seções_site`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `Sites`
--
ALTER TABLE `Sites`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tbl_active_log`
--
ALTER TABLE `tbl_active_log`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tbl_admin`
--
ALTER TABLE `tbl_admin`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tbl_author`
--
ALTER TABLE `tbl_author`
  ADD PRIMARY KEY (`author_id`);

--
-- Índices de tabela `tbl_books`
--
ALTER TABLE `tbl_books`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tbl_book_page_notes`
--
ALTER TABLE `tbl_book_page_notes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_book_page` (`user_id`,`book_id`,`page`);

--
-- Índices de tabela `tbl_category`
--
ALTER TABLE `tbl_category`
  ADD PRIMARY KEY (`cid`);

--
-- Índices de tabela `tbl_comments`
--
ALTER TABLE `tbl_comments`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tbl_favourite`
--
ALTER TABLE `tbl_favourite`
  ADD PRIMARY KEY (`id`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `tbl_home_section`
--
ALTER TABLE `tbl_home_section`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tbl_rating`
--
ALTER TABLE `tbl_rating`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tbl_reading`
--
ALTER TABLE `tbl_reading`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tbl_settings`
--
ALTER TABLE `tbl_settings`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_acervo_id` (`acervo_id`);

--
-- Índices de tabela `tbl_version`
--
ALTER TABLE `tbl_version`
  ADD PRIMARY KEY (`vid`);

--
-- Índices de tabela `tbl_wishlist`
--
ALTER TABLE `tbl_wishlist`
  ADD PRIMARY KEY (`id`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `vizualização_jogo`
--
ALTER TABLE `vizualização_jogo`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `vizualização_site`
--
ALTER TABLE `vizualização_site`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `acervos`
--
ALTER TABLE `acervos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de tabela `Autores_jogo`
--
ALTER TABLE `Autores_jogo`
  MODIFY `author_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de tabela `Autores_site`
--
ALTER TABLE `Autores_site`
  MODIFY `author_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT de tabela `Categoría_jogo`
--
ALTER TABLE `Categoría_jogo`
  MODIFY `cid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `Categoría_site`
--
ALTER TABLE `Categoría_site`
  MODIFY `cid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de tabela `Comentarios_jogo`
--
ALTER TABLE `Comentarios_jogo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `Comentarios_site`
--
ALTER TABLE `Comentarios_site`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `Jogos`
--
ALTER TABLE `Jogos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT de tabela `livros_acervos`
--
ALTER TABLE `livros_acervos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=410;

--
-- AUTO_INCREMENT de tabela `rating_jogos`
--
ALTER TABLE `rating_jogos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `rating_sites`
--
ALTER TABLE `rating_sites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `Seções_jogo`
--
ALTER TABLE `Seções_jogo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `Seções_site`
--
ALTER TABLE `Seções_site`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `Sites`
--
ALTER TABLE `Sites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT de tabela `tbl_active_log`
--
ALTER TABLE `tbl_active_log`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=601;

--
-- AUTO_INCREMENT de tabela `tbl_admin`
--
ALTER TABLE `tbl_admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `tbl_author`
--
ALTER TABLE `tbl_author`
  MODIFY `author_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT de tabela `tbl_books`
--
ALTER TABLE `tbl_books`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=209;

--
-- AUTO_INCREMENT de tabela `tbl_book_page_notes`
--
ALTER TABLE `tbl_book_page_notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT de tabela `tbl_category`
--
ALTER TABLE `tbl_category`
  MODIFY `cid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de tabela `tbl_comments`
--
ALTER TABLE `tbl_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=259;

--
-- AUTO_INCREMENT de tabela `tbl_favourite`
--
ALTER TABLE `tbl_favourite`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de tabela `tbl_home_section`
--
ALTER TABLE `tbl_home_section`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT de tabela `tbl_rating`
--
ALTER TABLE `tbl_rating`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=148;

--
-- AUTO_INCREMENT de tabela `tbl_reading`
--
ALTER TABLE `tbl_reading`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=327;

--
-- AUTO_INCREMENT de tabela `tbl_settings`
--
ALTER TABLE `tbl_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=793;

--
-- AUTO_INCREMENT de tabela `tbl_version`
--
ALTER TABLE `tbl_version`
  MODIFY `vid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `tbl_wishlist`
--
ALTER TABLE `tbl_wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de tabela `vizualização_jogo`
--
ALTER TABLE `vizualização_jogo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `vizualização_site`
--
ALTER TABLE `vizualização_site`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `livros_acervos`
--
ALTER TABLE `livros_acervos`
  ADD CONSTRAINT `fk_la_acervo` FOREIGN KEY (`acervo_id`) REFERENCES `acervos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_la_book` FOREIGN KEY (`book_id`) REFERENCES `tbl_books` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD CONSTRAINT `fk_user_acervo` FOREIGN KEY (`acervo_id`) REFERENCES `acervos` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
