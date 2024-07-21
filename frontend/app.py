from flask import Flask, render_template, request, jsonify
from web3 import Web3
import json
from config import config

app = Flask(__name__)

# Configuração da conexão com a blockchain
print(f"Conectando à blockchain em {config.INFURA_URL}")
web3 = Web3(Web3.HTTPProvider(config.INFURA_URL))

# Carregando a ABI do contrato
with open('frontend/abi/Auction.json', 'r') as f:
    data = json.load(f)
    abi = data['abi']
    print(f"ABI Carregada: {abi}")

# Convertendo o endereço do contrato para o formato de checksum
contract_address = web3.to_checksum_address(config.CONTRACT_ADDRESS)
print(f"Endereço do contrato (checksummed): {contract_address}")

# Criando a instância do contrato
contract = web3.eth.contract(address=contract_address, abi=abi)
print("Instância do contrato criada com sucesso.")

@app.route('/')
def index():
    try:
        highest_bid = contract.functions.highestBid().call()
        highest_bidder = contract.functions.highestBidder().call()
        highest_bid_in_ether = Web3.from_wei(highest_bid, 'ether')
        return render_template('index.html', highest_bid=highest_bid_in_ether, highest_bidder=highest_bidder)
    except Exception as e:
        print(f"Erro na rota index: {e}")
        return str(e)

@app.route('/bid', methods=['POST'])
def bid():
    try:
        data = request.get_json()
        amount = float(data['amount'])
        highest_bid = contract.functions.highestBid().call()
        
        # Verificação se o novo lance é maior que o lance atual mais alto
        if Web3.to_wei(amount, 'ether') <= highest_bid:
            return jsonify({'error': f"Seu lance deve ser maior que o lance atual mais alto de {Web3.from_wei(highest_bid, 'ether')} Ether."})

        nonce = web3.eth.get_transaction_count(config.ACCOUNT_ADDRESS)
        txn = contract.functions.bid().build_transaction({
            'from': config.ACCOUNT_ADDRESS,
            'value': Web3.to_wei(amount, 'ether'),
            'gas': 2000000,
            'gasPrice': Web3.to_wei('50', 'gwei'),
            'nonce': nonce
        })
        signed_txn = web3.eth.account.sign_transaction(txn, private_key=config.PRIVATE_KEY)
        web3.eth.send_raw_transaction(signed_txn.rawTransaction)
        return jsonify({'message': 'Lance feito com sucesso!'})
    except Exception as e:
        print(f"Erro na rota bid: {e}")
        return jsonify({'error': str(e)})

@app.route('/auction_data')
def auction_data():
    try:
        highest_bid = contract.functions.highestBid().call()
        highest_bidder = contract.functions.highestBidder().call()
        highest_bid_in_ether = Web3.from_wei(highest_bid, 'ether')
        return jsonify({
            'highest_bid': highest_bid_in_ether,
            'highest_bidder': highest_bidder
        })
    except Exception as e:
        print(f"Erro na rota auction_data: {e}")
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    
    app.run(debug=True)
