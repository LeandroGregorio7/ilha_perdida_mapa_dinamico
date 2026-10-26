import { useMemo, useState, type CSSProperties } from 'react';
import {
  BookOpen, Check, ChevronDown, CloudRain, Compass, Eye, EyeOff, Info,
  Layers3, Map, MapPin, Move, RotateCcw, TreePine, Waves, ZoomIn, ZoomOut,
} from 'lucide-react';
import IslandMap from './components/IslandMap';
import { BOOK_CONTEXT, LAYER_LABELS, MAP_NOTICE, MAP_POINTS, type LayerKey } from './data/island';

const INITIAL_LAYERS: Record<LayerKey, boolean> = {
  vegetation: true,
  storyPoints: true,
  floodRisk: true,
  coordinates: true,
};

export default function App() {
  const [layers, setLayers] = useState(INITIAL_LAYERS);
  const [rainHours, setRainHours] = useState(24);
  const [compare, setCompare] = useState(true);
  const [swipe, setSwipe] = useState(52);
  const [moveMode, setMoveMode] = useState(false);
  const [selectedPointId, setSelectedPointId] = useState('simao');
  const [zoomSignal, setZoomSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [layersOpen, setLayersOpen] = useState(true);
  const selectedPoint = useMemo(
    () => MAP_POINTS.find((point) => point.id === selectedPointId) ?? MAP_POINTS[0],
    [selectedPointId],
  );

  const toggleLayer = (key: LayerKey) => setLayers((current) => ({ ...current, [key]: !current[key] }));
  const resetMap = () => {
    setResetSignal((current) => current + 1);
    setSwipe(52);
    setRainHours(24);
    setLayers(INITIAL_LAYERS);
    setCompare(true);
    setMoveMode(false);
    setSelectedPointId('simao');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Ilha Perdida, início">
          <span className="brand-mark" aria-hidden="true"><Compass size={23} strokeWidth={2.5} /></span>
          <span className="brand-copy"><strong>ILHA PERDIDA</strong><small>MAPA DE EXPLORAÇÃO</small></span>
        </a>
        <div className="topbar-meta">
          <span className="class-chip">GEOGRAFIA <b>7º ANO</b></span>
          <span className="topbar-divider" />
          <span className="book-credit">A partir do livro de Maria José Dupré</span>
        </div>
      </header>

      <main id="inicio" className="page-layout">
        <section className="map-column" aria-labelledby="map-title">
          <div className="page-intro">
            <div>
              <div className="eyebrow"><span className="eyebrow-dot" /> TRABALHO DE GEOGRAFIA</div>
              <h1 id="map-title">Explore a ilha <span className="title-sparkle">✳</span></h1>
              <p>Veja os lugares da história e compare como a água pode mudar a paisagem.</p>
            </div>
            <div className="map-status"><span className="status-dot" /> MAPA ESQUEMÁTICO</div>
          </div>

          <div className="map-card">
            <div className="map-card-top">
              <div className="map-card-title"><Map size={17} /><span>ILHA NO RIO PARAÍBA DO SUL</span></div>
              <div className="map-card-actions">
                <button className={`tool-button ${moveMode ? 'is-active' : ''}`} onClick={() => setMoveMode((current) => !current)} aria-pressed={moveMode} title="Ativar ou desativar o modo de mover pontos">
                  <Move size={15} /> <span>{moveMode ? 'Movendo pontos' : 'Mover pontos'}</span>
                </button>
                <button className="icon-tool" onClick={() => setZoomSignal((current) => current - 1)} aria-label="Diminuir zoom" title="Diminuir zoom"><ZoomOut size={17} /></button>
                <button className="icon-tool" onClick={() => setZoomSignal((current) => current + 1)} aria-label="Aumentar zoom" title="Aumentar zoom"><ZoomIn size={17} /></button>
                <button className="icon-tool" onClick={resetMap} aria-label="Reiniciar mapa" title="Voltar ao mapa inicial"><RotateCcw size={16} /></button>
              </div>
            </div>

            <div className="map-stage">
              <IslandMap
                layers={layers}
                points={MAP_POINTS}
                rainHours={rainHours}
                compare={compare}
                swipe={swipe}
                moveMode={moveMode}
                onSelectPoint={setSelectedPointId}
                zoomSignal={zoomSignal}
                resetSignal={resetSignal}
              />
              <div className="scene-label scene-label-storm"><CloudRain size={13} /> {compare ? `${rainHours}h DE CHUVA` : 'CENÁRIO DE CHUVA'}</div>
              <div className="scene-label scene-label-normal"><Waves size={13} /> {compare ? 'DIA NORMAL' : 'CHUVA · VISÃO COMPLETA'}</div>
              <div className="map-instruction"><Move size={14} /><span>Arraste para explorar · toque nos pontos</span></div>
            </div>

            <div className="map-legend-strip" aria-label="Legenda do mapa">
              <strong>LEGENDA</strong>
              <span><i className="legend-square legend-forest" /> Mata fechada</span>
              <span><i className="legend-square legend-point" /> Pontos da história</span>
              <span><i className="legend-square legend-risk" /> Risco de inundação</span>
              <span><i className="legend-square legend-flood" /> Água na simulação</span>
            </div>

            {compare ? <div className="swipe-control">
              <div className="swipe-caption"><span><i className="legend-dot storm-dot" /> Chuva intensa</span><span className="swipe-help">Arraste o controle para comparar</span><span><i className="legend-dot normal-dot" /> Dia normal</span></div>
              <input aria-label="Deslize para comparar chuva intensa e dia normal" type="range" min="10" max="90" value={swipe} onChange={(event) => setSwipe(Number(event.target.value))} style={{ '--range-progress': `${((swipe - 10) / 80) * 100}%` } as CSSProperties} />
            </div> : <div className="full-scene-note"><Info size={14} /> Comparação desligada: mostrando a ilha inteira no cenário de {rainHours} h de chuva.</div>}

            <div className="map-bottomline">
              <div className="scale-pill"><span className="scale-icon"><MapPin size={14} /></span><span>Escala fictícia <b>0 ━━━━━ 100 m</b></span></div>
              {layers.coordinates && <div className="coord-pill">COORDENADAS SIMPLES <b>A–D · 1–4</b></div>}
              <button className={`compare-toggle ${compare ? 'selected' : ''}`} onClick={() => setCompare((current) => !current)} aria-pressed={compare}>
                {compare ? <Eye size={15} /> : <EyeOff size={15} />}{compare ? 'Comparar cenários' : 'Voltar à comparação'}
              </button>
            </div>
          </div>
          <p className="map-note"><Info size={14} /> {MAP_NOTICE}</p>
        </section>

        <aside className="control-column" aria-label="Controles e informações do mapa">
          <section className="story-card">
            <div className="section-kicker"><BookOpen size={15} /> SOBRE O LIVRO</div>
            <h2>A aventura acontece aqui</h2>
            <p>{BOOK_CONTEXT}</p>
            <div className="story-footer"><span className="story-badge">MARIA JOSÉ DUPRÉ</span><span>1ª edição · 1944</span></div>
          </section>

          <section className="control-card rain-card" aria-labelledby="rain-title">
            <div className="card-heading">
              <span className="heading-icon rain-icon"><CloudRain size={18} /></span>
              <div><div className="section-kicker">SIMULADOR DE CENÁRIO</div><h2 id="rain-title">E se chover muito?</h2></div>
            </div>
            <p className="card-copy">Mude o tempo de chuva e observe as áreas baixas.</p>
            <div className="rain-value"><strong>{rainHours}</strong><span>horas de chuva</span><span className="rain-max">/ 24 h</span></div>
            <input className="rain-slider" aria-label="Duração da chuva simulada em horas" type="range" min="0" max="24" step="1" value={rainHours} onChange={(event) => setRainHours(Number(event.target.value))} style={{ '--range-progress': `${(rainHours / 24) * 100}%` } as CSSProperties} />
            <div className="range-labels"><span>0 h · sem chuva</span><span>24 h · chuva extrema</span></div>
            <div className="rain-explainer"><Waves size={15} /><span>{rainHours === 0 ? 'Sem chuva simulada: veja a ilha no cenário normal.' : rainHours < 8 ? 'A água começa a subir nas partes mais baixas.' : rainHours < 18 ? 'Mais horas de chuva ampliam a área alagada na simulação.' : rainHours < 24 ? 'A água alcança mais áreas baixas no cenário extremo.' : 'Após 24 horas, a área alagada fica maior.'}</span></div>
            <div className="classroom-note"><b>Clima e prevenção:</b> conhecer áreas de risco ajuda a pensar em caminhos e lugares mais seguros. Simulação visual para a atividade, não é uma previsão real.</div>
          </section>

          <section className="control-card layer-card">
            <button className="section-toggle" onClick={() => setLayersOpen((current) => !current)} aria-expanded={layersOpen}>
              <span className="heading-icon layer-icon"><Layers3 size={18} /></span>
              <span className="layer-title"><span className="section-kicker">CONTROLE DE CAMADAS</span><strong>O que aparece no mapa</strong></span>
              <ChevronDown size={17} className={layersOpen ? 'chevron open' : 'chevron'} />
            </button>
            {layersOpen && <div className="layer-list">
              {LAYER_LABELS.map((layer) => (
                <label className="layer-row" key={layer.key}>
                  <span className={`layer-swatch swatch-${layer.key}`} aria-hidden="true">{layer.key === 'vegetation' ? <TreePine size={15} /> : layer.key === 'storyPoints' ? <MapPin size={14} /> : layer.key === 'floodRisk' ? <Waves size={15} /> : <Map size={14} />}</span>
                  <span className="layer-label"><strong>{layer.label}</strong><small>{layer.helper}</small></span>
                  <input type="checkbox" checked={layers[layer.key]} onChange={() => toggleLayer(layer.key)} aria-label={`Mostrar camada: ${layer.label}`} />
                  <span className="switch" aria-hidden="true"><span /></span>
                </label>
              ))}
            </div>}
          </section>

          <section className="selected-card" aria-live="polite">
            <div className="selected-pin" style={{ backgroundColor: selectedPoint.color }}><MapPin size={16} /></div>
            <div><div className="section-kicker">PONTO SELECIONADO</div><strong>{selectedPoint.title}</strong><p>{selectedPoint.description}</p></div>
          </section>

          <button className={`reset-button ${moveMode ? 'reset-highlight' : ''}`} onClick={resetMap}>
            <RotateCcw size={15} /> Voltar ao mapa inicial <span><Check size={14} /> pronto</span>
          </button>
        </aside>
      </main>

      <footer className="site-footer">
        <span><Compass size={14} /> Mapa escolar inspirado em <i>A Ilha Perdida</i></span>
        <span>As cores mostram uma ideia de risco, não um mapa de previsão.</span>
        <span className="license-notice">© 2026 Projeto Ilha Perdida · sem garantia · <a href="https://github.com/LeandroGregorio7/ilha_perdida_mapa_dinamico/blob/main/LICENSE" target="_blank" rel="noreferrer">Ver licença AGPL-3.0</a></span>
      </footer>
    </div>
  );
}
