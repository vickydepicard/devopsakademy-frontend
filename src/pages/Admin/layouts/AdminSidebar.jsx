<NavLink
  to="/admin/messages"
  className={({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg ${
      isActive ? "bg-accent text-primary font-semibold" : "text-gray-200 hover:bg-white/10"
    }`
  }
>
  <Mail size={18} />
  <span>Messages reçus</span>

  <Link
  to="/admin/messages"
  className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded transition"
>
  📩 <span>Messages</span>
</Link>

</NavLink>
