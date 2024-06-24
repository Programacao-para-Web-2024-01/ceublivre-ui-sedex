document.addEventListener('DOMContentLoaded', () => {
    const produtos = document.getElementById('produto');
    const quantidade = document.getElementById('quantidade');
    const listaProdutos = document.getElementById('lista-produtos');
    const valorTotal = document.getElementById('valor-total');

    let total = 0;
    let produtosCache = {}; 
    async function fetchProducts() {
        try {
            const response = await fetch('http://localhost:8080/products');

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const products = await response.json();
            console.log('Produtos recebidos do servidor:', products);
            produtos.innerHTML = ''; 

            products.forEach(product => {
                const option = document.createElement('option');
                option.value = `${product.name} - ${product.price}`;
                option.textContent = `${product.name} - R$${product.price.toFixed(2)}`;
                produtos.appendChild(option);
                produtosCache[product.name] = product;
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            alert('Erro ao buscar produtos. Por favor, tente novamente mais tarde.');
        }
    }

    fetchProducts();

    function obterImagemProduto(nomeProduto) {
        return nomeProduto.toLowerCase().replace(/\s+/g, '-') + '.jpg';
    }

    async function adicionar() {
        const produtoInfo = produtos.value.split(' - ');
        const nomeProduto = produtoInfo[0];
        const precoProduto = parseFloat(produtoInfo[1]);
        const qtde = parseInt(quantidade.value);
    
        if (isNaN(qtde) || qtde <= 0) {
            alert('Quantidade inválida!');
            return;
        }
    
        const product = produtosCache[nomeProduto];
        if (!product) {
            alert('Produto não encontrado!');
            return;
        }
    
        console.log('Produto selecionado:', product);
        console.log('Quantidade solicitada:', qtde);
        console.log('Quantidade em estoque antes de adicionar:', product.quantity_stock);
    
        if (qtde > product.quantity_stock) {
            alert(`Estoque insuficiente para ${nomeProduto}`);
            return;
        }
    
        try {
            const response = await fetch('http://localhost:8080/cart/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: product.product_id,
                    quantity: qtde
                })
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const newItem = await response.json();
    
            const produtoHTML = `
                <section class="carrinho__produtos__produto" data-id="${newItem.product_id}" data-nome="${nomeProduto}" data-preco="${precoProduto}" data-qtde="${qtde}">
                    <img src="./assets/${obterImagemProduto(nomeProduto)}" alt="${nomeProduto}">
                    <div>
                        <h3>${nomeProduto}</h3>
                        <p>Preço: R$${precoProduto.toFixed(2)}</p>
                        <div class="quantity">
                            <label for="quantity_${newItem.product_id}">Quantidade:</label>
                            <input type="number" id="quantity_${newItem.product_id}" value="${qtde}" data-preco="${precoProduto}">
                            <button class="update" data-id="${newItem.product_id}">Atualizar</button>
                            <button class="remove" data-id="${newItem.product_id}">Remover</button>
                        </div>
                    </div>
                </section>
            `;
            listaProdutos.insertAdjacentHTML('beforeend', produtoHTML);
            total += precoProduto * qtde;
            product.quantity_stock -= qtde;
            console.log('Quantidade em estoque após adicionar:', product.quantity_stock);
            atualizarTotal();
            adicionarEventListeners();
        } catch (error) {
            console.error('Error adding product to cart:', error);
            alert('Erro ao adicionar produto ao carrinho');
        }
    }
    

    async function atualizarQuantidade(event) {
        const id = event.target.dataset.id;
        const produtoElement = document.querySelector(`.carrinho__produtos__produto[data-id="${id}"]`);
        const inputQuantidade = produtoElement.querySelector('input[type="number"]');
        const qtdeAntiga = parseInt(produtoElement.dataset.qtde);
        const qtdeNova = parseInt(inputQuantidade.value);
        const precoProduto = parseFloat(produtoElement.dataset.preco);

        if (isNaN(qtdeNova) || qtdeNova <= 0) {
            alert('Quantidade inválida!');
            return;
        }

        const product = produtosCache[produtoElement.dataset.nome];
        if (!product) {
            alert('Produto não encontrado!');
            return;
        }

        console.log('Atualizando quantidade do produto:', product);
        console.log('Quantidade antiga:', qtdeAntiga);
        console.log('Nova quantidade:', qtdeNova);
        console.log('Quantidade em estoque antes de atualizar:', product.quantity_stock);

        if (qtdeNova > product.quantity_stock + qtdeAntiga) {
            alert(`Estoque insuficiente para ${produtoElement.dataset.nome}`);
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/cart/items/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quantity: qtdeNova
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update product quantity');
            }

            total += (qtdeNova - qtdeAntiga) * precoProduto;
            product.quantity_stock -= (qtdeNova - qtdeAntiga);
            produtoElement.dataset.qtde = qtdeNova;
            console.log('Quantidade em estoque após atualizar:', product.quantity_stock);
            atualizarTotal();
        } catch (error) {
            console.error('Error updating product quantity:', error);
            alert('Erro ao atualizar quantidade do produto');
        }
    }

    async function removerProduto(event) {
        const id = event.target.dataset.id;
        const produtoElement = document.querySelector(`.carrinho__produtos__produto[data-id="${id}"]`);
        const qtde = parseInt(produtoElement.dataset.qtde);
        const precoProduto = parseFloat(produtoElement.dataset.preco);

        const product = produtosCache[produtoElement.dataset.nome];
        if (!product) {
            alert('Produto não encontrado!');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/cart/items/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove product from cart');
            }

            total -= qtde * precoProduto;
            product.quantity_stock += qtde;
            produtoElement.remove();
            console.log('Quantidade em estoque após remover:', product.quantity_stock);
            atualizarTotal();
        } catch (error) {
            console.error('Error removing product from cart:', error);
            alert('Erro ao remover produto do carrinho');
        }
    }

    function limpar() {
        produtos.selectedIndex = 0;
        quantidade.value = 1;
        listaProdutos.innerHTML = '';
        total = 0;
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
