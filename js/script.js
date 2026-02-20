const { createApp } = Vue;

createApp({

  data() {
    return {
      pokemonList: [],
      search: '',
      searchId: '',
      selectedPokemon: {},
      currentPage: 1,
      perPage: 20,
      loading: true,

      newPokemon: {
        name: '',
        image: ''
      }
    }
  },

  mounted() {

    const savedList = localStorage.getItem('pokemonList');

    if (savedList) {
      this.loadFromLocalStorage();
      this.loading = false;
    } else {

      fetch('https://pokeapi.co/api/v2/pokemon?limit=1302')
        .then(res => res.json())
        .then(data => {

          this.pokemonList = data.results.map((p, index) => {
            const id = index + 1;

            return {
              id: id,
              name: p.name,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
            };
          });

          this.saveToLocalStorage();
          this.loading = false;
        })
        .catch(error => {
          console.error("Error:", error);
          this.loading = false;
        });
    }
  },

  computed: {

    filteredPokemon() {
      return this.pokemonList.filter(p => {

        const matchName =
          p.name.toLowerCase().includes(this.search.toLowerCase());

        const matchId =
          this.searchId === '' ||
          p.id == this.searchId;

        return matchName && matchId;
      });
    },

    totalPages() {
      return Math.ceil(this.filteredPokemon.length / this.perPage) || 1;
    },

    paginatedPokemon() {
      const start = (this.currentPage - 1) * this.perPage;
      return this.filteredPokemon.slice(start, start + this.perPage);
    },

    progress() {
      if (this.pokemonList.length === 0) return 0;

      return Math.round(
        (this.filteredPokemon.length / this.pokemonList.length) * 100
      );
    },

    averageId() {
      if (this.filteredPokemon.length === 0) return 0;

      let total = this.filteredPokemon.reduce(
        (sum, p) => sum + p.id, 0
      );

      return Math.round(total / this.filteredPokemon.length);
    }

  },

  watch: {

    search() {
      this.currentPage = 1;
      this.saveToLocalStorage();
    },

    searchId() {
      this.currentPage = 1;
      this.saveToLocalStorage();
    },

    currentPage() {
      this.saveToLocalStorage();
    },

    pokemonList: {
      handler() {
        this.saveToLocalStorage();
      },
      deep: true
    }

  },

  methods: {

    saveToLocalStorage() {
      localStorage.setItem('pokemonList', JSON.stringify(this.pokemonList));
      localStorage.setItem('search', this.search);
      localStorage.setItem('searchId', this.searchId);
      localStorage.setItem('currentPage', this.currentPage);
    },

    loadFromLocalStorage() {
      const savedList = localStorage.getItem('pokemonList');
      const savedSearch = localStorage.getItem('search');
      const savedSearchId = localStorage.getItem('searchId');
      const savedPage = localStorage.getItem('currentPage');

      if (savedList) {
        this.pokemonList = JSON.parse(savedList);
      }

      if (savedSearch) {
        this.search = savedSearch;
      }

      if (savedSearchId) {
        this.searchId = savedSearchId;
      }

      if (savedPage) {
        this.currentPage = parseInt(savedPage);
      }
    },

    addPokemon() {

      if (!this.newPokemon.name) {
        alert("El nombre es obligatorio");
        return;
      }

      const maxId = this.pokemonList.length > 0
        ? Math.max(...this.pokemonList.map(p => p.id))
        : 0;

      const newId = maxId + 1;

      const pokemon = {
        id: newId,
        name: this.newPokemon.name.toLowerCase(),
        image: this.newPokemon.image || 
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'
      };

      this.pokemonList.push(pokemon);

      this.newPokemon.name = '';
      this.newPokemon.image = '';

      this.saveToLocalStorage();

      alert("Pokémon agregado correctamente 🔥");
    },

    showDetail(poke) {

      fetch(`https://pokeapi.co/api/v2/pokemon/${poke.id}`)
        .then(res => res.json())
        .then(detail => {

          this.selectedPokemon = {
            ...poke,
            base_experience: detail.base_experience,
            height: detail.height,
            weight: detail.weight,
            abilities: detail.abilities
          };

          const modal = new bootstrap.Modal(
            document.getElementById('detailModal')
          );

          modal.show();
        })
        .catch(() => {
          this.selectedPokemon = poke;

          const modal = new bootstrap.Modal(
            document.getElementById('detailModal')
          );

          modal.show();
        });
    },

    deletePokemon(id) {
      this.pokemonList =
        this.pokemonList.filter(p => p.id !== id);

      this.saveToLocalStorage();
    },

    clearStorage() {
      localStorage.clear();
      location.reload();
    }

  }

}).mount('#app');
