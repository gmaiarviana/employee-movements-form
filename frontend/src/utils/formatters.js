/**
 * Formata um CPF para o padrão ###.###.###-##
 * @param {string} cpf - CPF sem formatação
 * @returns {string} CPF formatado ou "Não informado" se inválido
 */
export const formatCPF = (cpf) => {
  if (!cpf || cpf === null || cpf === undefined) {
    return "Não informado";
  }

  // Remove todos os caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return "Não informado";
  }

  // Aplica a formatação ###.###.###-##
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata uma data ISO para o padrão DD/MM/AAAA
 * @param {string} isoDate - Data no formato ISO (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss)
 * @returns {string} Data formatada ou "Não informado" se inválida
 */
export const formatDate = (isoDate) => {
  if (!isoDate || isoDate === null || isoDate === undefined) {
    return "Não informado";
  }

  try {
    // Cria objeto Date a partir da string ISO
    const date = new Date(isoDate);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      return "Não informado";
    }

    // Formata para DD/MM/AAAA
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    return "Não informado";
  }
};

/**
 * Retorna o RG sem alteração (já vem formatado do banco)
 * @param {string} rg - RG já formatado
 * @returns {string} RG ou "Não informado" se inválido
 */
export const formatRG = (rg) => {
  if (!rg || rg === null || rg === undefined || rg.trim() === '') {
    return "Não informado";
  }

  return rg.trim();
};
