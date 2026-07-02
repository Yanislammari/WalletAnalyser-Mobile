export const clusterName = (n: number | undefined): string => {
  if(n == undefined || n == null) {
    return 'Cluster unknow'
  }
  const names = [
    "Alpha", "Beta", "Gamma", "Delta", "Epsilon",
    "Zeta", "Eta", "Theta", "Iota", "Kappa",
    "Lambda", "Mu", "Nu", "Xi", "Omicron",
    "Pi", "Rho", "Sigma", "Tau", "Upsilon"
  ];
  return n <= 20 ? (names[n] ?? String(n)) : "Cluster " + String(n);
};