import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { QrCode, Download, Printer, Maximize2, X, Link as LinkIcon, Settings2 } from 'lucide-react';

const QRGenerator = () => {
  const [numberOfTables, setNumberOfTables] = useState(10);
  const [selectedTable, setSelectedTable] = useState(null);

  // Base URL - This will be your deployed app URL (for now localhost)
  const BASE_URL = 'http://localhost:5173';

  const generateQRValue = (tableNumber) => {
    return `${BASE_URL}?table=${tableNumber}`;
  };

  const downloadQR = (tableNumber) => {
    const canvas = document.getElementById(`qr-${tableNumber}`);
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Table-${tableNumber}-QR.png`;
      link.href = url;
      link.click();
    }
  };

  const downloadAllQRs = () => {
    for (let i = 1; i <= numberOfTables; i++) {
      setTimeout(() => downloadQR(i), i * 200);
    }
  };

  const printQR = (tableNumber) => {
    const canvas = document.getElementById(`qr-${tableNumber}`);
    if (canvas) {
      const win = window.open('', '_blank');
      win.document.write(`
        <html>
          <head>
            <title>Table ${tableNumber} QR Code</title>
            <style>
              body { 
                display: flex; 
                flex-direction: column;
                justify-content: center; 
                align-items: center; 
                height: 100vh;
                margin: 0;
                font-family: system-ui, -apple-system, sans-serif;
                background-color: white;
              }
              .container {
                text-align: center;
                padding: 40px;
                border: 2px dashed #cbd5e1;
                border-radius: 24px;
              }
              h1 { margin: 0 0 24px 0; color: #0f172a; font-size: 32px; }
              img { border-radius: 12px; }
              p { margin-top: 24px; font-size: 16px; color: #64748b; font-weight: 500; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Table ${tableNumber}</h1>
              <img src="${canvas.toDataURL()}" style="width: 250px; height: 250px;" />
              <p>Scan to view menu & order</p>
            </div>
          </body>
        </html>
      `);
      win.document.close();
      setTimeout(() => win.print(), 250); // Small delay to ensure image renders before print dialog
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-indigo-600" />
            Table QR Generator
          </h2>
          <p className="text-sm text-slate-500 mt-1">Generate and manage scannable menus for your tables</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <Settings2 className="w-4 h-4 text-slate-400 ml-2" />
          <label className="text-sm font-semibold text-slate-700">Total Tables:</label>
          <input
            type="number"
            min="1"
            max="100"
            value={numberOfTables}
            onChange={(e) => setNumberOfTables(parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-semibold text-center transition-all"
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <LinkIcon className="w-4 h-4 text-indigo-400" />
          <span>Base routing URL:</span>
          <code className="bg-white px-2 py-1 rounded-md border border-slate-200 text-indigo-600 font-mono text-xs">
            {BASE_URL}
          </code>
        </div>
        <button
          onClick={downloadAllQRs}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <Download className="w-4 h-4" />
          Download All
        </button>
      </div>

      {/* QR Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: numberOfTables }, (_, i) => i + 1).map((tableNumber) => (
          <div 
            key={tableNumber} 
            className="group bg-white rounded-xl p-4 text-center border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
          >
            <h3 className="text-sm font-bold text-slate-700 mb-3">Table {tableNumber}</h3>
            
            {/* QR Canvas Wrapper */}
            <div 
              className="bg-slate-50 p-3 rounded-xl inline-block mb-4 border border-slate-100 cursor-pointer group-hover:scale-105 transition-transform duration-300"
              onClick={() => setSelectedTable(tableNumber)}
              title="Click to preview"
            >
              <QRCodeCanvas
                id={`qr-${tableNumber}`}
                value={generateQRValue(tableNumber)}
                size={120}
                level="H"
                includeMargin={false}
                className="rounded-md"
              />
            </div>

            {/* Subtle Action Row instead of heavy stacked buttons */}
            <div className="flex justify-center gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => downloadQR(tableNumber)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => printQR(tableNumber)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Print"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedTable(tableNumber)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Preview"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal (Glassmorphism) */}
      {selectedTable && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" 
          onClick={() => setSelectedTable(null)}
        >
          <div 
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-white/20 transform transition-all" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Table {selectedTable}</h3>
              <button 
                onClick={() => setSelectedTable(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-2xl mb-6 border border-slate-100 flex justify-center shadow-inner">
              <QRCodeCanvas
                value={generateQRValue(selectedTable)}
                size={200}
                level="H"
                includeMargin={false}
                className="rounded-xl"
              />
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3 mb-6 border border-slate-100 overflow-hidden">
              <LinkIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <p className="text-xs text-slate-600 font-mono truncate">
                {generateQRValue(selectedTable)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => downloadQR(selectedTable)}
                className="flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => printQR(selectedTable)}
                className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default QRGenerator;