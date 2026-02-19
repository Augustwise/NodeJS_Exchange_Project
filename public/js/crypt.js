function switchMainTab(event, tabId) {
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            
            document.getElementById(tabId).classList.add('active');
            event.currentTarget.classList.add('active');
        }

        function switchChart(event, coinId) {
            document.querySelectorAll('.tv-chart').forEach(chart => chart.classList.remove('active'));
            document.querySelectorAll('.coin-btn').forEach(btn => btn.classList.remove('active'));
            
            document.getElementById(coinId).classList.add('active');
            event.currentTarget.classList.add('active');
        }

        function createChart(container, symbol) {
            new TradingView.widget({
                width: "100%",
                height: 560, 
                symbol: symbol,
                interval: "60",
                timezone: "Europe/Kiev",
                theme: "dark",
                style: "1",
                locale: "uk",
                allow_symbol_change: false,
                container_id: container,
                backgroundColor: "rgba(22, 27, 34, 0)", 
                gridColor: "rgba(255, 255, 255, 0.05)"
            });
        }

        document.addEventListener("DOMContentLoaded", () => {
            createChart("btc", "BINANCE:BTCUSDT");
            createChart("eth", "BINANCE:ETHUSDT");
            createChart("sol", "BINANCE:SOLUSDT");
            createChart("ada", "BINANCE:ADAUSDT");
            createChart("bnb", "BINANCE:BNBUSDT");
            createChart("xpr", "BINANCE:XRPUSDT");
            createChart("ton", "BINANCE:TONUSDT");
            createChart("doge", "BINANCE:DOGEUSDT");
            createChart("pepe", "BINANCE:PEPEUSDT");
        });