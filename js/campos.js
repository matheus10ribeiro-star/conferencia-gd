/* Definição dos campos da SS e do projeto (rótulos exibidos na interface) */
const SSF=[
 ['ss','Nº da SS'],['servico','Serviço'],['data','Data da solicitação'],['prioridade','Prioridade'],
 ['cliente','Cliente'],['uc','UC'],['endereco','Endereço'],['localidade','Localidade'],
 ['tipoLig','Tipo de ligação'],['atividade','Atividade'],['classe','Classe'],['subgrupo','Subgrupo'],['tarifa','Estrutura tarifária'],
 ['potTrafo','Potência do trafo (kVA)'],['tensaoForn','Tensão de fornecimento (V)'],['tensaoMed','Tensão de medição (V)'],['postoTrafo','Posto do trafo'],
 ['medidor','Medidor (nº)'],['medModelo','Modelo do medidor'],['cte','Constante'],['chAfer','Chave de aferição (nº)'],['chAferModelo','Modelo da chave'],
 ['tcSeries','TCs (nº de série)'],['tcRel','Relação dos TCs'],['tpSeries','TPs (nº de série)'],['tpRel','Relação dos TPs'],['observacao','Observação']
];
const PRJ=[
 ['Identificação',[['uc','UC no projeto'],['cliente','Cliente no projeto'],['localidade','Município'],['empresa','Projetista / empresa'],['resp','Responsável técnico'],['dataPrj','Data do projeto']]],
 ['Módulos',[['modQtd','Quantidade de módulos'],['modMarca','Marca'],['modModelo','Modelo'],['modW','Potência unitária (W)'],['kwpDecl','Potência C.C. declarada (kWp)'],['strings','Strings (ex.: 10x18, 2x13)']]],
 ['Inversor',[['invQtd','Quantidade de inversores'],['invMarca','Marca'],['invModelo','Modelo (quadro de resumo)'],['invModelo2','Modelo (unifilar / outra folha)'],['invKw','Potência nominal C.A. total (kW)'],['invTensao','Tensão de saída (V)'],['mppt','MPPTs utilizados']]],
 ['Proteções',[['protCC','Proteção C.C. (por MPPT/string)'],['stringbox','String box C.A. (disjuntor/DPS)'],['caboInv','Cabo inversor → proteção'],['disjGeral','Disjuntor geral da medição (A)'],['disjGeral2','Disjuntor geral — outro valor no desenho (A)'],['dpsGeral','DPS da proteção geral'],['disjQdg','Disjuntor geral do QDG (A)']]],
 ['Medição',[['medStatus','Medidor no projeto',['','Existente','Existente — 4 quadrantes','Bidirecional a instalar','Ambíguo (existente e a instalar)']],['tcRel','Relação dos TCs no projeto'],['tcClasse','Classe / FT dos TCs'],['tpRel','Relação dos TPs no projeto']]],
 ['Transformador e entrada',[['trafoKva','Potência do trafo (kVA)'],['trafoPrim','Tensão primária (kV)'],['trafoSec','Tensão secundária (V)'],['trafoSit','Situação do trafo',['','Existente','Novo']],['gerador','Gerador auxiliar'],['chaveFus','Chave fusível / elo'],['pararaios','Para-raios']]],
 ['Sinalização e aterramento',[['plEntrada','Placa no padrão de entrada'],['plPoste','Placa no poste do trafo'],['plQdg','Advertência no QDG'],['aterr','Aterramento']]],
 ['Outras observações do projeto',[['obsPrj','Observações (texto livre)','area']]]
];
