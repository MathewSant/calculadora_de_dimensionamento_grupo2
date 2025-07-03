'use client';

import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import contatores from '../data/contatores.json';
import reles from '../data/reles.json';
import relesSobrecarga from '../data/reles_sobrecarga.json';
import fusiveis from '../data/fusiveis.json';

export default function Home() {
  const [potencia, setPotencia] = useState('');
  const [tensao, setTensao] = useState(380);
  const [comprimento, setComprimento] = useState(30);
  const [ipIn, setIpIn] = useState(7);
  const [tp, setTp] = useState(5);
  const [trb, setTrb] = useState(10);
  const [resultado, setResultado] = useState(null);

  const calcular = () => {
    const potenciaNum = parseFloat(potencia);
    if (!potenciaNum) return alert('Informe a potência corretamente');

    const corrente = (potenciaNum * 736) / (Math.sqrt(3) * tensao * 0.9 * 0.9);

    const correntePartida = corrente * ipIn;

    const protecaoOk = tp <= trb;

    const contator = contatores.find(c => c.corrente_nominal_a >= corrente);

    const rele = relesSobrecarga.find(r => {
      const faixa = r.corrente_ajustavel_a.replace(',', '.').split('...').map(Number);
      return corrente >= faixa[0] && corrente <= faixa[1];
    });

    const releEletronico = reles.reles_sobrecarga_eletronicos.find(r => {
      const faixa = r.faixa_corrente_a.split('...').map(Number);
      return corrente >= faixa[0] && corrente <= faixa[1];
    });

    const fusivel = fusiveis.find(f => corrente <= f.corrente_nominal_inversor_a);

    const gamma = 56;
    const deltaV = 0.01 * tensao;
    const secaoCalculada = (Math.sqrt(3) * corrente * comprimento) / (gamma * deltaV);

    const bitolas = [2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
    const bitolaFinal = bitolas.find(b => b >= secaoCalculada) || 'Acima de 300mm²';

    setResultado({
      corrente: corrente.toFixed(2),
      correntePartida: correntePartida.toFixed(2),
      protecaoOk,
      contator,
      rele,
      releEletronico,
      fusivel,
      secaoCondutor: typeof bitolaFinal === 'number' ? `${bitolaFinal} mm²` : bitolaFinal
    });
  };

  return (
    <>
      <Head>
        <title>Calculadora de Dimensionamento | Engenharia Elétrica</title>
      </Head>

      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-between p-4">
        <main className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-10">
          <div className="flex justify-center">
            <Image
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRdL7xoIFyuPG0m-ho76xty9ivkxOpPo-vZw&s"
              alt="Logo UPE POLI"
              width={180}
              height={80}
              className="rounded-md"
            />
          </div>

          <h1 className="text-4xl font-extrabold mb-8 text-center text-blue-800">
            ⚡ Calculadora de Dimensionamento
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-slate-700">Potência (CV)</label>
              <input
                type="number"
                className="w-full border rounded-xl px-4 py-3 text-black"
                value={potencia}
                onChange={e => setPotencia(e.target.value)}
                placeholder="Ex: 20"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-slate-700">Tensão (V)</label>
              <select
                className="w-full border rounded-xl px-4 py-3 text-black"
                value={tensao}
                onChange={e => setTensao(Number(e.target.value))}
              >
                <option value={220}>220V</option>
                <option value={380}>380V</option>
                <option value={440}>440V</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-slate-700">Comprimento (m)</label>
              <input
                type="number"
                className="w-full border rounded-xl px-4 py-3  text-black"
                value={comprimento}
                onChange={e => setComprimento(e.target.value)}
                placeholder="Ex: 30"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-slate-700">IP/IN</label>
              <input
                type="number"
                className="w-full border rounded-xl px-4 py-3 text-black"
                value={ipIn}
                onChange={e => setIpIn(Number(e.target.value))}
                placeholder="Ex: 7"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-slate-700">Tempo de Partida (tp) [s]</label>
              <input
                type="number"
                className="w-full border rounded-xl px-4 py-3 text-black"
                value={tp}
                onChange={e => setTp(Number(e.target.value))}
                placeholder="Ex: 5"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-slate-700">Tempo da Proteção (trb) [s]</label>
              <input
                type="number"
                className="w-full border rounded-xl px-4 py-3 text-black"
                value={trb}
                onChange={e => setTrb(Number(e.target.value))}
                placeholder="Ex: 10"
              />
            </div>
          </div>

          <button
            onClick={calcular}
            className="mt-8 w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-2xl shadow-md transition"
          >
            🔍 Calcular
          </button>

          {resultado && (
            <div className="mt-10 bg-slate-50 p-6 rounded-2xl shadow-inner text-black">
              <h2 className="text-2xl font-bold mb-4 text-blue-700">Resultado</h2>
              <p>🔌 <strong>Corrente nominal:</strong> {resultado.corrente} A</p>
              <p>⚡ <strong>Corrente de partida:</strong> {resultado.correntePartida} A</p>
              <p>
                🔒 <strong>Proteção:</strong>{' '}
                {resultado.protecaoOk ? '✅ Proteção adequada' : '❌ Proteção não adequada (trb < tp)'}
              </p>
              <div className="mt-4 space-y-2">
                <p>⚙️ <strong>Contator:</strong> {resultado.contator?.modelo || 'Não encontrado'}</p>
                <p>🧠 <strong>Relé Térmico:</strong> {resultado.rele?.modelo || 'Não encontrado'}</p>
                <p>🔋 <strong>Relé Eletrônico:</strong> {resultado.releEletronico?.modelo || 'Não encontrado'}</p>
                <p>🛡️ <strong>Fusível:</strong> {resultado.fusivel?.modelo_fusivel_recomendado || 'Não encontrado'}</p>
                <p>🧵 <strong>Condutor:</strong> {resultado.secaoCondutor}</p>
              </div>
            </div>
          )}
        </main>

        <footer className="text-center mt-10 mb-4 text-slate-500 text-sm">
          🔗 Desenvolvido por estudantes de Engenharia Elétrica • UPE POLI • 2025
        </footer>
      </div>
    </>
  );
}
