import mapboxgl from "mapbox-gl/dist/mapbox-gl.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { Subject } from "rxjs";
import { v4 } from "uuid";

mapboxgl.accessToken =
	"pk.eyJ1IjoibW9pc2VzNzE3IiwiYSI6ImNram95aDRubTB0aWEycHBlYmh2NTVzN28ifQ.I3TP0atxQZGsWrCYdqij1Q";

export const useMapbox = (puntoInicial) => {
	const setRef = useCallback((node) => {
		mapaDiv.current = node;
	}, []);

	//Referencia a los markadores
	const marcadores = useRef({});

	// Observables de rxjs
	const movimientoMarcador = useRef(new Subject());
	const nuevoMarcador = useRef(new Subject());

	//mapa y coords
	const mapaDiv = useRef();

	const mapa = useRef();
	const [coords, setCoords] = useState(puntoInicial);

	/// Funcion para agregar marcadores

	const agregarMarcador = useCallback((e, id) => {
		const { lng, lat } = e.lngLat || e;
		const marker = new mapboxgl.Marker();
		marker.id = id ?? v4();

		marker
			.setLngLat({
				lng,
				lat,
			})
			.addTo(mapa.current)
			.setDraggable(true);

		marcadores.current[marker.id] = marker;

		if (!id) {
			nuevoMarcador.current.next({
				id: marker.id,
				lng,
				lat,
			});
		}

		// Escuchar movimientos del marcador
		marker.on("drag", ({ target }) => {
			const { id } = target;
			const { lng, lat } = target.getLngLat();

			// emitir los cambios del marcador

			movimientoMarcador.current.next({
				id,
				lng,
				lat,
			});
		});
	}, []);

	// Funcion para actualizar la ubicacion del marcador
	const actualizarPosicion = useCallback(({ id, lng, lat }) => {
		marcadores.current[id].setLngLat([lng, lat]);
	}, []);

	useEffect(() => {
		const map = new mapboxgl.Map({
			container: mapaDiv.current,
			style: "mapbox://styles/mapbox/streets-v11",
			center: [puntoInicial.lng, puntoInicial.lat],
			zoom: puntoInicial.zoom,
		});
		mapa.current = map;
	}, [puntoInicial]);

	//Cuando se mueva el mapa
	useEffect(() => {
		mapa.current?.on("move", () => {
			const { lng, lat } = mapa.current.getCenter();

			setCoords({
				lng: lng.toFixed(4),
				lat: lat.toFixed(4),
				zoom: mapa.current.getZoom().toFixed(2),
			});
		});
	}, []);

	//Agregar marcadores al hacer click

	useEffect(() => {
		mapa.current?.on("click", agregarMarcador);
	}, [agregarMarcador]);

	return {
		agregarMarcador,
		actualizarPosicion,
		coords,
		setRef,
		marcadores,
		nuevoMarcador$: nuevoMarcador.current,
		movimientoMarcador$: movimientoMarcador.current,
	};
};
