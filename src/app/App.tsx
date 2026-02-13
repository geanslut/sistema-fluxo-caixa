import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { useStorage } from './hooks/useStorage';
import { useConfiguracoes } from './hooks/useConfiguracoes';
import { Dashboard } from './components/Dashboard';
import { FormularioVenda } from './components/FormularioVenda';
import { FormularioDespesa } from './components/FormularioDespesa';
import { Historico } from './components/Historico';
import { Configuracoes } from './components/Configuracoes';
import { Settings, LogOut, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/ui/alert-dialog";

type TabType = 'dashboard' | 'venda' | 'despesa' | 'historico' | 'configuracoes';

function AppContent() {
  const { user, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { saldos, transacoes, adicionarTransacao, removerTransacao, limparDados } = useStorage();
  const { configuracoes, atualizarMaterial, atualizarModelo, adicionarCustoFixo, editarCustoFixo, removerCustoFixo, adicionarModelo, adicionarMaterial, removerMaterial } = useConfiguracoes();

  // Handle browser back button for settings tab
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If we are in settings and user goes back, switch to dashboard
      if (activeTab === 'configuracoes') {
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTab]);

  const toggleSettings = () => {
    if (activeTab === 'configuracoes') {
      if (window.location.hash === '#configuracoes') {
        window.history.back();
      } else {
        setActiveTab('dashboard');
      }
    } else {
      window.history.pushState({ tab: 'configuracoes' }, '', '#configuracoes');
      setActiveTab('configuracoes');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#243645] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#243645] h-[77px] px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div>
            <p className="font-normal text-[24.378px] text-white" style={{ fontVariationSettings: "'opsz' 14" }}>
              Fluxo de Caixa
            </p>
            <p className="font-light text-[#cecece] text-[9.88px]" style={{ fontVariationSettings: "'opsz' 14" }}>
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSettings}
            className="bg-[#294c65] rounded-[15px] size-[51px] flex items-center justify-center hover:opacity-90 transition-opacity"
            title="Configurações"
          >
            <Settings className="w-6 h-6 text-white" strokeWidth={1.5} />
          </button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="bg-red-500/10 hover:bg-red-500/20 rounded-[15px] size-[51px] flex items-center justify-center transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5 text-red-400" strokeWidth={1.5} />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sair do Sistema</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja sair? Você precisará fazer login novamente para acessar seus dados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={signOut} className="bg-red-500 hover:bg-red-600 text-white">
                  Sair
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {activeTab === 'configuracoes' ? (
          <Configuracoes
            configuracoes={configuracoes}
            transacoes={transacoes}
            onAdicionarTransacao={adicionarTransacao}
            onAtualizarMaterial={atualizarMaterial}
            onAtualizarModelo={atualizarModelo}
            onAdicionarCustoFixo={adicionarCustoFixo}
            onEditarCustoFixo={editarCustoFixo}
            onRemoverCustoFixo={removerCustoFixo}
            onAdicionarModelo={adicionarModelo}
            onAdicionarMaterial={adicionarMaterial}
            onRemoverMaterial={removerMaterial}
            onLimparDados={limparDados}
          />
        ) : (
          <>
            {/* Dashboard */}
            <Dashboard saldos={saldos} transacoes={transacoes} />

            {/* Registrar Transação */}
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#294c65] h-[49px] rounded-[15px] w-[4px]" />
                <h2 className="text-[24.378px] text-[#243645] font-normal" style={{ fontVariationSettings: "'opsz' 14" }}>
                  Registrar Transação
                </h2>
              </div>

              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setActiveTab('venda')}
                  className={`flex-1 rounded-[34px] h-[58px] font-normal text-[18.074px] transition-all ${
                    activeTab === 'venda'
                      ? 'bg-[#243645] text-white'
                      : 'bg-white border border-[#535353] text-[#243645]'
                  }`}
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  Venda
                </button>
                <button
                  onClick={() => setActiveTab('despesa')}
                  className={`flex-1 rounded-[34px] h-[58px] font-normal text-[18.074px] transition-all ${
                    activeTab === 'despesa'
                      ? 'bg-[#243645] text-white'
                      : 'bg-white border border-[#535353] text-[#243645]'
                  }`}
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  Despesa
                </button>
              </div>

              {activeTab === 'venda' && (
                <FormularioVenda
                  onSalvar={adicionarTransacao}
                  materiais={configuracoes.materiais}
                  modelos={configuracoes.modelos}
                  custosFixos={configuracoes.custosFixos}
                />
              )}

              {activeTab === 'despesa' && (
                <FormularioDespesa onSalvar={adicionarTransacao} />
              )}
            </div>

            {/* Histórico */}
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#294c65] h-[49px] rounded-[15px] w-[4px]" />
                <h2 className="text-[24.378px] text-[#243645] font-normal" style={{ fontVariationSettings: "'opsz' 14" }}>
                  Histórico
                </h2>
              </div>

              <Historico
                transacoes={transacoes}
                modelos={configuracoes.modelos}
                materiais={configuracoes.materiais}
                onRemover={removerTransacao}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;