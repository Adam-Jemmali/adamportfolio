import {navIcons, navLinks} from "#constants/index.js";
import dayjs from "dayjs";

const Navbar = () => {
    return <nav>
        <div>  <img src="public/images/logo.svg" alt="logo" />
            <p>Adam's Portfolio</p>
            <ul>
                {navLinks.map(({id, name}) => (
                    <li key={id}>
                        <p> {name}</p>

                    </li>

                ))}
            </ul>
        </div>
        <div>
            <ul>
                {navIcons.map(({id, img}) => (
                    <li key={id}>
                        <img src={img} className="icon-hover" alt={`icon-${id}`} />

                    </li>

                ))}
            </ul>
            <time> {dayjs().format("YYYY-MM-DD h:mm A")}</time>
        </div>

    </nav>
}
export default Navbar
