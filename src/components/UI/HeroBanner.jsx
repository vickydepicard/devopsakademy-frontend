import { motion } from "framer-motion";

const HeroBanner = () => {
  return (
    <section className="relative bg-blue-900 text-white py-20 px-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-5xl mx-auto text-center"
      >
        <h1 className="text-5xl font-extrabold leading-tight mb-6">
          Formez-vous au <span className="text-green-400">DevOps Moderne</span>
        </h1>
        <p className="text-gray-200 text-lg max-w-3xl mx-auto mb-8">
          Apprenez Docker, Kubernetes, CI/CD, Ansible et plus encore sur une plateforme interactive et certifiante.
        </p>
        <a
          href="/register"
          className="inline-block bg-green-500 hover:bg-green-600 transition text-white px-6 py-3 rounded-xl font-semibold"
        >
          Commencer maintenant
        </a>
      </motion.div>
    </section>
  );
};

export default HeroBanner;
