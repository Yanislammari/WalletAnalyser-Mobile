import { StyleSheet } from "react-native";

const PURPLE = "#9333ea";
const PURPLE_DARK = "#7e22ce";

export const LoginStyles = StyleSheet.create({
  /* ── Background ── */
  background: {
    flex: 1,
    backgroundColor: "#1a0533", // deep purple, replaces gradient background
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.35,
  },
  blobTopLeft: {
    width: 300,
    height: 300,
    backgroundColor: "#7c3aed",
    top: -80,
    left: -80,
  },
  blobBottomRight: {
    width: 260,
    height: 260,
    backgroundColor: "#a855f7",
    bottom: -60,
    right: -60,
  },

  /* ── Layout ── */
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  /* ── Card ── */
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },

  /* ── Back button ── */
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 4,
  },
  backArrow: {
    fontSize: 22,
    color: "#6b7280",
  },

  /* ── Header ── */
  header: {
    marginBottom: 24,
    marginTop: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  titleAccent: {
    color: PURPLE,
  },

  /* ── Inputs ── */
  input: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: "#111827",
    marginBottom: 12,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },
  eyeIcon: {
    fontSize: 18,
    marginLeft: 8,
  },

  /* ── Forgotten password ── */
  forgotContainer: {
    alignItems: "center",
    marginBottom: 16,
    marginTop : 4,
  },
  forgotText: {
    fontSize: 16,
    color: PURPLE,
  },

  /* ── Login button ── */
  loginBtn: {
    backgroundColor: PURPLE,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  loginBtnDisabled: {
    opacity: 0.5,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  /* ── Divider ── */
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#d1d5db",
  },
  dividerText: {
    fontSize: 11,
    color: "#9ca3af",
    marginHorizontal: 10,
  },

  /* ── Google button stub ── */
  googleBtn: {
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  googleBtnText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "500",
  },

  /* ── Sign up ── */
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    fontSize: 13,
    color: "#6b7280",
  },
  signupLink: {
    fontSize: 16,
    color: PURPLE,
    fontWeight: "500",
    marginTop : 5
  },
});