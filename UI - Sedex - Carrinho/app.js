document.addEventListener('DOMContentLoaded', () => {
    const produtos = document.getElementById('produto');
    const quantidade = document.getElementById('quantidade');
    const listaProdutos = document.getElementById('lista-produtos');
    const valorTotal = document.getElementById('valor-total');
  
    let total = 0;
  
    const estoque = {
      'Fone de Ouvido': 100,
      'Celular': 50,
      'Oculus VR': 10
    };
  
    function obterImagemProduto(nomeProduto) {
      return nomeProduto.toLowerCase().replace(/\s+/g, '-') + '.jpg';
    }
  
    function adicionar() {
      const produtoInfo = produtos.value.split(' - ');
      const nomeProduto = produtoInfo[0];
      const precoProduto = parseFloat(produtoInfo[1]);
      const qtde = parseInt(quantidade.value);
  
      if (isNaN(qtde) || qtde <= 0) {
        alert('Quantidade inválida!');
        return;
      }
  
      if (qtde > estoque[nomeProduto]) {
        alert(`Estoque insuficiente para ${nomeProduto}`);
        return;
      }
  
      const precoTotalProduto = precoProduto * qtde;
      const imagemProduto = obterImagemProduto(nomeProduto);
  
      const produtoHTML = `
        <section class="carrinho__produtos__produto" data-nome="${nomeProduto}" data-preco="${precoProduto}" data-qtde="${qtde}">
          <img src="./assets/${imagemProduto}" alt="${nomeProduto}">
          <div>
            <h3>${nomeProduto}</h3>
            <p>Preço: R$${precoProduto.toFixed(2)}</p>
            <div class="quantity">
              <label for="quantity_${nomeProduto}">Quantidade:</label>
              <input type="number" id="quantity_${nomeProduto}" value="${qtde}" data-preco="${precoProduto}">
              <button class="update" data-nome="${nomeProduto}">Atualizar</button>
              <button class="remove" data-nome="${nomeProduto}">Remover</button>
            </div>
          </div>
        </section>
      `;
  
      listaProdutos.insertAdjacentHTML('beforeend', produtoHTML);
      total += precoTotalProduto;
      estoque[nomeProduto] -= qtde; 
      atualizarTotal();
  
      adicionarEventListeners();
    }
  
    function limpar() {
      produtos.selectedIndex = 0;
      quantidade.value = 0;
      listaProdutos.innerHTML = '';
      total = 0;
      atualizarTotal();
    }
  
    function atualizarQuantidade(event) {
      const nomeProduto = event.target.dataset.nome;
      const produtoElement = document.querySelector(`.carrinho__produtos__produto[data-nome="${nomeProduto}"]`);
      const inputQuantidade = produtoElement.querySelector('input[type="number"]');
      const qtdeAntiga = parseInt(produtoElement.dataset.qtde);
      const qtdeNova = parseInt(inputQuantidade.value);
      const precoProduto = parseFloat(produtoElement.dataset.preco);
  
      if (isNaN(qtdeNova) || qtdeNova <= 0) {
        alert('Quantidade inválida!');
        return;
      }
  
      if (qtdeNova > estoque[nomeProduto]) {
        alert(`Estoque insuficiente para ${nomeProduto}`);
        return;
      }
  
      total += (qtdeNova - qtdeAntiga) * precoProduto;
      estoque[nomeProduto] -= (qtdeNova - qtdeAntiga);
      produtoElement.dataset.qtde = qtdeNova;
  
      atualizarTotal();
    }
  
    function removerProduto(event) {
      const nomeProduto = event.target.dataset.nome;
      const produtoElement = document.querySelector(`.carrinho__produtos__produto[data-nome="${nomeProduto}"]`);
      const qtde = parseInt(produtoElement.dataset.qtde);
      const precoProduto = parseFloat(produtoElement.dataset.preco);
  
      total -= qtde * precoProduto;
      estoque[nomeProduto] += qtde;
      produtoElement.remove();
  
      atualizarTotal();
    }
  
    function atualizarTotal() {
      valorTotal.textContent = `R$${total.toFixed(2)}`;
    }
  
    function adicionarEventListeners() {
      document.querySelectorAll('.update').forEach(button => button.addEventListener('click', atualizarQuantidade));
      document.querySelectorAll('.remove').forEach(button => button.addEventListener('click', removerProduto));
    }
  
    window.adicionar = adicionar;
    window.limpar = limpar;
  });
  