document.addEventListener('DOMContentLoaded', () => {
    const produtos = document.getElementById('produto');
    const quantidade = document.getElementById('quantidade');
    const listaProdutos = document.getElementById('lista-produtos');
    const valorTotal = document.getElementById('valor-total');
  
    let total = 0;
  
    function adicionar() {
      const produtoInfo = produtos.value.split(' - R$');
      const nomeProduto = produtoInfo[0];
      const precoProduto = parseFloat(produtoInfo[1]);
      const qtde = parseInt(quantidade.value);
  
      const precoTotalProduto = precoProduto * qtde;
  
      const produtoHTML = `
        <section class="carrinho__produtos__produto">
          <img src="imagem-produto.jpg" alt="${nomeProduto}">
          <div>
            <h3>${nomeProduto}</h3>
            <p>Preço: R$${precoProduto.toFixed(2)}</p>
            <div class="quantity">
              <label for="quantity_${nomeProduto}">Quantidade:</label>
              <input type="number" id="quantity_${nomeProduto}" value="${qtde}" data-preco="${precoProduto}">
              <button class="update">Atualizar</button>
              <button class="remove">Remover</button>
            </div>
          </div>
        </section>
      `;
  
      listaProdutos.insertAdjacentHTML('beforeend', produtoHTML);
      total += precoTotalProduto;
      atualizarTotal();
  
      document.querySelectorAll('.update').forEach(button => button.addEventListener('click', atualizarQuantidade));
      document.querySelectorAll('.remove').forEach(button => button.addEventListener('click', removerProduto));
    }
  
    function limpar() {
      produtos.selectedIndex = 0;
      quantidade.value = 1;
    }
  
    function atualizarQuantidade(event) {
      const inputQuantidade = event.target.parentElement.querySelector('input[type="number"]');
      const qtdeAntiga = parseInt(inputQuantidade.defaultValue);
      const qtdeNova = parseInt(inputQuantidade.value);
      const precoProduto = parseFloat(inputQuantidade.dataset.preco);
  
      total += (qtdeNova - qtdeAntiga) * precoProduto;
      inputQuantidade.defaultValue = qtdeNova;
  
      atualizarTotal();
    }
  
    function removerProduto(event) {
      const produtoElement = event.target.closest('.carrinho__produtos__produto');
      const inputQuantidade = produtoElement.querySelector('input[type="number"]');
      const qtde = parseInt(inputQuantidade.value);
      const precoProduto = parseFloat(inputQuantidade.dataset.preco);
  
      total -= qtde * precoProduto;
      produtoElement.remove();
  
      atualizarTotal();
    }
  
    function atualizarTotal() {
      valorTotal.textContent = `R$${total.toFixed(2)}`;
    }
  });
  