"""
Script de Migração de Dados - Excel para Supabase
Data: 24 de Janeiro de 2026
Descrição: Migra dados da planilha Excel para o schema estruturacao no Supabase
"""

import pandas as pd
from supabase import create_client, Client
from datetime import datetime
import os
import sys

# Configuração do Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ ERRO: Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_KEY não configuradas!")
    print("\nConfigure-as executando:")
    print("  export SUPABASE_URL='sua_url'")
    print("  export SUPABASE_SERVICE_KEY='sua_chave'")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def carregar_planilha(caminho: str) -> dict:
    """Carrega todas as abas relevantes da planilha."""
    print(f"📂 Carregando planilha: {caminho}")

    try:
        # Tenta carregar diferentes abas
        abas_disponiveis = pd.ExcelFile(caminho).sheet_names
        print(f"   Abas encontradas: {abas_disponiveis}")

        dados = {}

        # Tenta carregar cada aba
        for nome_aba in ['Pipe', 'Histórico', 'Pendências']:
            if nome_aba in abas_disponiveis:
                dados[nome_aba.lower()] = pd.read_excel(caminho, sheet_name=nome_aba)
                print(f"   ✅ Aba '{nome_aba}' carregada com {len(dados[nome_aba.lower()])} linhas")
            else:
                print(f"   ⚠️  Aba '{nome_aba}' não encontrada")

        return dados
    except Exception as e:
        print(f"❌ Erro ao carregar planilha: {e}")
        sys.exit(1)

def buscar_referencias():
    """Busca IDs das tabelas de referência."""
    print("\n🔍 Buscando referências do banco de dados...")

    try:
        # Buscar categorias
        categorias_res = supabase.table('categorias').select('id, codigo').execute()
        categorias = {r['codigo']: r['id'] for r in categorias_res.data} if categorias_res.data else {}
        print(f"   Categorias: {len(categorias)} encontradas")

        # Buscar veículos
        veiculos_res = supabase.table('veiculos').select('id, sigla').execute()
        veiculos = {r['sigla']: r['id'] for r in veiculos_res.data} if veiculos_res.data else {}
        print(f"   Veículos: {len(veiculos)} encontrados")

        # Buscar usuários
        usuarios_res = supabase.table('user_profiles').select('id, nome').execute()
        usuarios = {r['nome']: r['id'] for r in usuarios_res.data} if usuarios_res.data else {}
        print(f"   Usuários: {len(usuarios)} encontrados")

        # Buscar analistas
        analistas_res = supabase.schema('estruturacao').table('analistas_gestao').select('id, nome').execute()
        analistas = {r['nome']: r['id'] for r in analistas_res.data} if analistas_res.data else {}
        print(f"   Analistas: {len(analistas)} encontrados")

        return categorias, veiculos, usuarios, analistas
    except Exception as e:
        print(f"❌ Erro ao buscar referências: {e}")
        return {}, {}, {}, {}

def converter_data(valor):
    """Converte diferentes formatos de data para ISO."""
    if pd.isna(valor):
        return None
    if isinstance(valor, datetime):
        return valor.isoformat()
    try:
        return pd.to_datetime(valor).isoformat()
    except:
        return None

def mapear_status(status_planilha: str) -> str:
    """Mapeia status da planilha para o banco."""
    if pd.isna(status_planilha):
        return 'Em Estruturação'

    mapeamento = {
        'Em Estruturação': 'Em Estruturação',
        'Liquidada': 'Liquidada',
        'On hold': 'On Hold',
        'On Hold': 'On Hold',
        'Abortada': 'Abortada',
        'Finalizada': 'Finalizada'
    }
    return mapeamento.get(str(status_planilha), 'Em Estruturação')

def migrar_operacao(row, refs):
    """Converte uma linha da planilha para o formato do banco."""
    categorias, veiculos, usuarios, analistas = refs

    # Mapeamento de colunas (adapte conforme sua planilha)
    return {
        'numero_emissao': str(row.get('Emissão', row.get('Numero Emissao', ''))),
        'nome_operacao': str(row.get('Operação', row.get('Nome Operacao', 'Sem nome'))),
        'status': mapear_status(row.get('Status')),
        'pmo_id': usuarios.get(row.get('PMO')),
        'analista_gestao_id': analistas.get(row.get('Analista Gestão', row.get('Analista Gestao'))),
        'categoria_id': categorias.get(row.get('Categoria')),
        'veiculo_id': veiculos.get(row.get('Veículo', row.get('Veiculo'))),
        'volume': float(row.get('Volume', 0)) if pd.notna(row.get('Volume')) else 0,
        'empresa_cnpj': str(row.get('CNPJ', '')) if pd.notna(row.get('CNPJ')) else None,
        'empresa_razao_social': str(row.get('Razão Social', row.get('Razao Social', ''))) if pd.notna(row.get('Razão Social', row.get('Razao Social'))) else None,
        'data_entrada_pipe': converter_data(row.get('Data de Entrada no Pipe', row.get('Data Entrada'))),
        'data_previsao_liquidacao': converter_data(row.get('Previsão de Liquidação', row.get('Previsao Liquidacao'))),
        'data_liquidacao': converter_data(row.get('Data de Liquidação', row.get('Data Liquidacao'))),
        'data_primeira_pagamento': converter_data(row.get('1ª Data de Pagamento', row.get('Primeira Data Pagamento'))),
        'floating': bool(row.get('Floating')) if pd.notna(row.get('Floating')) else False,
        'proximos_passos': str(row.get('Próximos Passos', row.get('Proximos Passos', ''))) if pd.notna(row.get('Próximos Passos', row.get('Proximos Passos'))) else None,
        'alertas': str(row.get('Alertas', '')) if pd.notna(row.get('Alertas')) else None,
        'resumo': str(row.get('Resumo', '')) if pd.notna(row.get('Resumo')) else None,
        'fee_estruturacao': float(row.get('Fee Estruturação', 0)) if pd.notna(row.get('Fee Estruturação')) else None,
        'fee_gestao': float(row.get('Fee Gestão', row.get('Remuneração', 0))) if pd.notna(row.get('Fee Gestão', row.get('Remuneração'))) else None,
        'boletagem': str(row.get('Boletagem', '')) if pd.notna(row.get('Boletagem')) else None,
    }

def executar_migracao(caminho_planilha: str):
    """Executa a migração completa."""
    print("\n" + "="*60)
    print("🚀 INICIANDO MIGRAÇÃO DE DADOS")
    print("="*60)

    # Carregar dados
    dados = carregar_planilha(caminho_planilha)

    if not dados:
        print("❌ Nenhuma aba válida encontrada na planilha!")
        return

    # Buscar referências
    refs = buscar_referencias()

    # Contador de sucessos e erros
    total_sucessos = 0
    total_erros = 0

    # Migrar cada aba
    for nome_aba, df in dados.items():
        print(f"\n📊 Processando aba: {nome_aba.upper()}")
        print(f"   Total de linhas: {len(df)}")

        for idx, row in df.iterrows():
            try:
                operacao = migrar_operacao(row, refs)

                # Validar campos obrigatórios
                if not operacao['numero_emissao'] or operacao['numero_emissao'] == 'nan':
                    print(f"   ⚠️  Linha {idx+2}: Pulando (sem número de emissão)")
                    continue

                # Inserir no Supabase
                result = supabase.schema('estruturacao').table('operacoes').insert(operacao).execute()

                print(f"   ✅ Linha {idx+2}: {operacao['numero_emissao']} - {operacao['nome_operacao']}")
                total_sucessos += 1

            except Exception as e:
                print(f"   ❌ Linha {idx+2}: ERRO - {str(e)}")
                total_erros += 1

    # Resumo
    print("\n" + "="*60)
    print("📈 RESUMO DA MIGRAÇÃO")
    print("="*60)
    print(f"✅ Sucessos: {total_sucessos}")
    print(f"❌ Erros: {total_erros}")
    print(f"📊 Total processado: {total_sucessos + total_erros}")
    print("="*60)

if __name__ == "__main__":
    # Caminho da planilha
    caminho = "Pipe - Overview (3).xlsx"

    if not os.path.exists(caminho):
        print(f"❌ Arquivo não encontrado: {caminho}")
        print(f"   Procurando em: {os.getcwd()}")
        sys.exit(1)

    executar_migracao(caminho)
    print("\n✨ Migração concluída!")
