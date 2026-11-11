import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, OwnerData, legalEmail } from "@/components/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Aviso legal | Advanthor",
  description: "Aviso legal del sitio web de Advanthor: datos del titular, condiciones de uso, propiedad intelectual y responsabilidad.",
  path: "/aviso-legal",
});

export default function AvisoLegalPage() {
  return (
    <LegalPage
      title="Aviso legal"
      intro="En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de servicios de la sociedad de la información y de comercio electrónico (LSSI), se facilitan los datos identificativos del titular de este sitio web y las condiciones que regulan su uso."
    >
      <h2>1. Datos identificativos del titular</h2>
      <OwnerData />
      <p>En adelante, «Advanthor» o «el titular».</p>

      <h2>2. Objeto y ámbito de aplicación</h2>
      <p>
        Este aviso legal regula el acceso y el uso del sitio web, en el que Advanthor presenta sus servicios de creación
        web, mantenimiento web, SEO y posicionamiento, y ciberseguridad, publica contenidos informativos en su blog y ofrece
        vías para contactar con su equipo.
      </p>
      <p>
        Acceder a la web es gratuito y atribuye la condición de usuario, lo que implica aceptar este aviso legal en la
        versión publicada en cada momento. Si no estás de acuerdo con él, te pedimos que no utilices la web. La contratación
        de servicios se rige además por las <Link href="/condiciones-de-contratacion">condiciones de contratación</Link> y por
        la propuesta que acepte cada cliente.
      </p>

      <h2>3. Condiciones de uso</h2>
      <p>Al usar la web te comprometes a hacerlo de forma lícita y de buena fe y, en particular, a no:</p>
      <ul>
        <li>Utilizar sus contenidos para fines ilícitos, contrarios a la buena fe o que lesionen derechos de terceros.</li>
        <li>Introducir o difundir virus, código malicioso o cualquier otro elemento que pueda dañar sistemas o datos.</li>
        <li>Intentar acceder sin autorización a áreas restringidas, sistemas o datos del titular o de terceros.</li>
        <li>Enviar a través de los formularios información falsa, publicidad no solicitada o envíos masivos automatizados.</li>
        <li>Suplantar la identidad de otra persona al contactar con nosotros.</li>
      </ul>
      <p>
        Advanthor podrá suspender o impedir el acceso a quien incumpla estas condiciones, sin perjuicio de las acciones
        legales que correspondan.
      </p>

      <h2>4. Propiedad intelectual e industrial</h2>
      <p>
        Los textos, el diseño, el código, el logotipo, la marca «Advanthor» y el resto de elementos de la web pertenecen a
        su titular o se utilizan con la autorización de sus legítimos propietarios, y están protegidos por el Real Decreto
        Legislativo 1/1996, de 12 de abril, por el que se aprueba el texto refundido de la Ley de Propiedad Intelectual, y
        por la Ley 17/2001, de 7 de diciembre, de Marcas.
      </p>
      <p>
        Puedes consultar, imprimir y guardar los contenidos para uso personal y privado. Queda prohibida su reproducción,
        distribución, comunicación pública o transformación con fines comerciales sin autorización previa y por escrito
        del titular. Las fotografías del blog proceden de Unsplash y se usan conforme a su licencia; las marcas de terceros
        que se citan pertenecen a sus propietarios.
      </p>

      <h2>5. Enlaces a sitios de terceros</h2>
      <p>
        La web incluye enlaces a sitios externos, como las fuentes de los artículos del blog o WhatsApp. Advanthor no
        controla esos sitios y no se responsabiliza de sus contenidos, de su disponibilidad ni de sus políticas, que se
        rigen por sus propias condiciones. Si tienes conocimiento de que un enlace lleva a contenidos ilícitos, escríbenos
        a {legalEmail()} y lo retiraremos con diligencia, conforme al artículo 17 de la LSSI.
      </p>

      <h2>6. Responsabilidad</h2>
      <p>
        Advanthor procura que la información de la web sea correcta y esté actualizada, y puede modificarla, ampliarla o
        retirarla en cualquier momento sin previo aviso. Los artículos del blog son de carácter informativo y no sustituyen
        el asesoramiento profesional sobre un caso concreto. Los precios y condiciones de cada servicio se confirman
        siempre en una propuesta por escrito.
      </p>
      <p>
        El titular no responde de los daños derivados de interrupciones técnicas, de fallos de la red o de terceros, de la
        presencia de virus que no haya podido detectar pese a aplicar medidas razonables de seguridad, ni del uso que el
        usuario haga de la web en contra de este aviso legal.
      </p>

      <h2>7. Protección de datos y cookies</h2>
      <p>
        El tratamiento de los datos personales que nos facilitas se explica en la{" "}
        <Link href="/politica-de-privacidad">política de privacidad</Link>, y el uso de cookies, en la{" "}
        <Link href="/politica-de-cookies">política de cookies</Link>.
      </p>

      <h2>8. Modificaciones</h2>
      <p>
        Advanthor puede actualizar este aviso legal para adaptarlo a cambios legales o de la web. La versión vigente es la
        publicada en esta página, con la fecha de su última actualización.
      </p>

      <h2>9. Legislación aplicable y jurisdicción</h2>
      <p>
        Este aviso legal se rige por la legislación española. Para cualquier controversia, las partes se someten a los
        juzgados y tribunales del domicilio del titular, salvo que el usuario tenga la condición de consumidor, en cuyo
        caso serán competentes los de su domicilio, conforme a la normativa de consumidores y usuarios.
      </p>
    </LegalPage>
  );
}
